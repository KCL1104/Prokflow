# Generate Report Edge Function

This Supabase Edge Function provides advanced report generation capabilities for the project management platform.

## Features

- **Multiple Report Types**: Project metrics, velocity trends, team metrics, cycle time analytics, and completion rate analytics
- **Multiple Formats**: JSON, CSV, and PDF export formats
- **Date Range Filtering**: Support for custom date ranges in analytics
- **Caching**: Built-in caching for improved performance
- **Authentication**: Integrated with Supabase Auth

## Deployment

To deploy this Edge Function to Supabase:

```bash
supabase functions deploy generate-report
```

## Usage

### Request Format

```typescript
POST /functions/v1/generate-report

{
  "projectId": "uuid",
  "reportType": "project-metrics" | "velocity-trends" | "team-metrics" | "cycle-time" | "completion-rate",
  "format": "json" | "csv" | "pdf",
  "dateRange": {
    "start": "2024-01-01T00:00:00Z",
    "end": "2024-01-31T23:59:59Z"
  },
  "options": {
    "sprintCount": 10,
    "includeCharts": true
  }
}
```

### Response

The function returns the report data in the requested format with appropriate headers for file download.

## Report Types

### Project Metrics
- Total work items
- Completed work items
- Average cycle time
- Average lead time
- Throughput metrics

### Velocity Trends
- Sprint-by-sprint velocity data
- Committed vs completed story points
- Velocity trend analysis

### Team Metrics
- Individual team member performance
- Completed items per member
- Average cycle time per member
- Current workload and utilization

### Cycle Time Analytics
- Average cycle time over date range
- Lead time analysis
- Throughput calculations

### Completion Rate Analytics
- Overall completion rate
- Completion trends over time
- Progress tracking

## Environment Variables

The function requires the following environment variables:

- `SUPABASE_URL`: Your Supabase project URL
- `SUPABASE_ANON_KEY`: Your Supabase anonymous key

## Error Handling

The function includes comprehensive error handling for:

- Missing or invalid parameters
- Database connection errors
- Authentication failures
- Report generation failures

## Performance Considerations

- Reports are generated on-demand
- Large datasets may take longer to process
- Consider implementing client-side caching for frequently accessed reports
- PDF generation is simplified and may need enhancement for production use

## Future Enhancements

- Advanced PDF generation with charts and graphs
- Email delivery of reports
- Scheduled report generation
- Custom report templates
- Advanced filtering and grouping options