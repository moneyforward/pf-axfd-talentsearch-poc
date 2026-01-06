# Employee Data Directory

This directory contains the employee data file used by the application.

## File: `employees.json`

This file should contain a JSON array of employee objects following the BigQuery schema from `mart_emp_search_employee_profile`.

### Quick Import from BigQuery

1. **Export from BigQuery**:
   ```sql
   SELECT *
   FROM `prod_mart.mart_emp_search_employee_profile`
   ORDER BY employee_id
   ```

2. **Save as JSON** in BigQuery console or use CLI:
   ```bash
   bq query --format=json --use_legacy_sql=false \
     "SELECT * FROM \`prod_mart.mart_emp_search_employee_profile\` ORDER BY employee_id" \
     > employees.json
   ```

3. **Copy to this directory**:
   ```bash
   cp employees.json backend/mock-data/employees/employees.json
   ```

### Schema Compatibility

The application automatically handles both data formats:

- **BigQuery Format**: Uses `dept_name` (hierarchical string like "Company > Division > Department")
- **Legacy Format**: Uses `dept_1`, `dept_2`, `dept_3`, etc. (separate fields)

The application will automatically convert `dept_name` to `dept_1`, `dept_2`, etc. when loading data, so you can use either format.

### Required Fields

Minimum required fields for each employee:
- `employee_id` (string)
- `employee_name` (string)

All other fields are optional and will default to `null` if not present.

### Array Fields

The following array fields are supported (may be `null` or empty arrays):
- `pulse_survey_history`
- `ggi_history`
- `ggi_monthly_history`
- `evaluation_history`
- `activity_history`
- `transfer_history`
- `grade_retention_history`

See `../big_query_mock/README.md` for detailed schema documentation.

