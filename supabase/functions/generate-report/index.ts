// Setup type definitions for built-in Supabase Runtime APIs
import 'jsr:@supabase/functions-js/edge-runtime.d.ts'
import { createClient } from 'jsr:@supabase/supabase-js@2'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

interface ReportRequest {
  projectId: string;
  reportType: 'project-metrics' | 'velocity-trends' | 'team-metrics' | 'cycle-time' | 'completion-rate';
  format: 'json' | 'csv' | 'pdf';
  dateRange?: {
    start: string;
    end: string;
  };
  options?: {
    sprintCount?: number;
    includeCharts?: boolean;
  };
}

Deno.serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders })
  }

  try {
    // Initialize Supabase client
    const supabaseClient = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_ANON_KEY') ?? '',
      {
        global: {
          headers: { Authorization: req.headers.get('Authorization')! },
        },
      }
    )

    // Parse request body
    const { projectId, reportType, format, dateRange, options }: ReportRequest = await req.json()

    if (!projectId || !reportType || !format) {
      return new Response(
        JSON.stringify({ error: 'Missing required parameters' }),
        { 
          status: 400, 
          headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
        }
      )
    }

    // Generate report data based on type
    let reportData: unknown;
    
    switch (reportType) {
      case 'project-metrics':
        reportData = await generateProjectMetrics(supabaseClient, projectId);
        break;
      case 'velocity-trends':
        reportData = await generateVelocityTrends(supabaseClient, projectId, options?.sprintCount);
        break;
      case 'team-metrics':
        reportData = await generateTeamMetrics(supabaseClient, projectId);
        break;
      case 'cycle-time':
        reportData = await generateCycleTimeAnalytics(supabaseClient, projectId, dateRange);
        break;
      case 'completion-rate':
        reportData = await generateCompletionRateAnalytics(supabaseClient, projectId);
        break;
      default:
        return new Response(
          JSON.stringify({ error: 'Invalid report type' }),
          { 
            status: 400, 
            headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
          }
        )
    }

    // Format the response based on requested format
    let response: Response;
    
    switch (format) {
      case 'json':
        response = new Response(
          JSON.stringify(reportData, null, 2),
          { 
            headers: { 
              ...corsHeaders, 
              'Content-Type': 'application/json',
              'Content-Disposition': `attachment; filename="${reportType}-${projectId}.json"`
            } 
          }
        );
        break;
      case 'csv': {
        const csvData = convertToCSV(reportData);
        response = new Response(
          csvData,
          { 
            headers: { 
              ...corsHeaders, 
              'Content-Type': 'text/csv',
              'Content-Disposition': `attachment; filename="${reportType}-${projectId}.csv"`
            } 
          }
        );
        break;
      }
      case 'pdf': {
        const pdfData = await generatePDF(reportData, reportType);
        response = new Response(
          pdfData,
          { 
            headers: { 
              ...corsHeaders, 
              'Content-Type': 'application/pdf',
              'Content-Disposition': `attachment; filename="${reportType}-${projectId}.pdf"`
            } 
          }
        );
        break;
      }
      default:
        return new Response(
          JSON.stringify({ error: 'Invalid format' }),
          { 
            status: 400, 
            headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
          }
        )
    }

    return response;

  } catch (error) {
    console.error('Report generation error:', error);
    return new Response(
      JSON.stringify({ error: 'Internal server error' }),
      { 
        status: 500, 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
      }
    )
  }
})

// Helper functions for data generation
async function generateProjectMetrics(supabase: ReturnType<typeof createClient>, projectId: string) {
  const { data, error } = await supabase.rpc('get_project_metrics', {
    p_project_id: projectId
  });
  
  if (error) throw error;
  return data?.[0] || {};
}

async function generateVelocityTrends(supabase: ReturnType<typeof createClient>, projectId: string, sprintCount = 10) {
  const { data, error } = await supabase.rpc('get_velocity_trends', {
    p_project_id: projectId,
    p_sprint_count: sprintCount
  });
  
  if (error) throw error;
  return data || [];
}

async function generateTeamMetrics(supabase: ReturnType<typeof createClient>, projectId: string) {
  const { data, error } = await supabase.rpc('get_team_metrics', {
    p_project_id: projectId
  });
  
  if (error) throw error;
  return data || [];
}

async function generateCycleTimeAnalytics(supabase: ReturnType<typeof createClient>, projectId: string, dateRange?: { start: string; end: string }) {
  const { data, error } = await supabase.rpc('get_cycle_time_analytics', {
    p_project_id: projectId,
    p_start_date: dateRange?.start,
    p_end_date: dateRange?.end
  });
  
  if (error) throw error;
  return data?.[0] || {};
}

async function generateCompletionRateAnalytics(supabase: ReturnType<typeof createClient>, projectId: string) {
  const { data, error } = await supabase.rpc('get_completion_rate_analytics', {
    p_project_id: projectId
  });
  
  if (error) throw error;
  return data?.[0] || {};
}

// Helper function to convert data to CSV
function convertToCSV(data: unknown): string {
  if (!data) return '';
  
  if (Array.isArray(data)) {
    if (data.length === 0) return '';
    
    const headers = Object.keys(data[0]);
    const csvRows = [
      headers.join(','),
      ...data.map(row => 
        headers.map(header => {
          const value = row[header];
          return typeof value === 'string' && value.includes(',') 
            ? `"${value}"` 
            : String(value);
        }).join(',')
      )
    ];
    
    return csvRows.join('\n');
  } else {
    const headers = Object.keys(data);
    const values = Object.values(data);
    return [headers.join(','), values.join(',')].join('\n');
  }
}

// Helper function to generate PDF (simplified)
function generatePDF(data: unknown, reportType: string): Promise<Uint8Array> {
  // This is a simplified PDF generation
  // In production, you'd use a proper PDF library like Puppeteer or jsPDF
  
  const htmlContent = generateHTMLReport(data, reportType);
  
  // For now, return a simple text-based PDF structure
  const pdfContent = `%PDF-1.4
1 0 obj
<<
/Type /Catalog
/Pages 2 0 R
>>
endobj

2 0 obj
<<
/Type /Pages
/Kids [3 0 R]
/Count 1
>>
endobj

3 0 obj
<<
/Type /Page
/Parent 2 0 R
/MediaBox [0 0 612 792]
/Contents 4 0 R
>>
endobj

4 0 obj
<<
/Length ${htmlContent.length}
>>
stream
BT
/F1 12 Tf
50 750 Td
(${reportType.toUpperCase()} REPORT) Tj
0 -20 Td
(Generated: ${new Date().toISOString()}) Tj
0 -40 Td
(${JSON.stringify(data).substring(0, 500)}...) Tj
ET
endstream
endobj

xref
0 5
0000000000 65535 f 
0000000009 00000 n 
0000000058 00000 n 
0000000115 00000 n 
0000000206 00000 n 
trailer
<<
/Size 5
/Root 1 0 R
>>
startxref
${300 + htmlContent.length}
%%EOF`;

  return Promise.resolve(new TextEncoder().encode(pdfContent));
}

function generateHTMLReport(data: unknown, reportType: string): string {
  return `
    <html>
      <head><title>${reportType} Report</title></head>
      <body>
        <h1>${reportType.replace('-', ' ').toUpperCase()} Report</h1>
        <p>Generated: ${new Date().toISOString()}</p>
        <pre>${JSON.stringify(data, null, 2)}</pre>
      </body>
    </html>
  `;
}