# BigQuery Data Schema and Import Instructions

This folder contains the schema documentation and sample data for the `mart_emp_search_employee_profile` table from BigQuery.

## Files in this folder

1. **schema_mart_emp_search_employee_profile.txt** - Schema documentation in Japanese
2. **schema_mart_emp_search_employee_profile_en.txt** - Schema documentation in English  
3. **sample_data_mart_emp_search_employee_profile.json** - Sample data following the BigQuery schema

## How to Import Data from BigQuery

### Step 1: Export Data from BigQuery

Run this query in BigQuery to export all employee data:

```sql
SELECT *
FROM `prod_mart.mart_emp_search_employee_profile`
ORDER BY employee_id
```

### Step 2: Export as JSON

1. In BigQuery console, after running the query:
   - Click **"Save results"** button
   - Select **"JSON (local file)"** or **"JSON (Cloud Storage)"**
   - Save the file

2. **OR** use the BigQuery CLI:
   ```bash
   bq query --format=json --use_legacy_sql=false \
     "SELECT * FROM \`prod_mart.mart_emp_search_employee_profile\` ORDER BY employee_id" \
     > employees_export.json
   ```

### Step 3: Copy to Application

1. Copy the exported JSON file to: `backend/mock-data/employees/employees.json`

2. **Important**: The JSON file should be a **JSON array** of employee objects, like this:
   ```json
   [
     {
       "employee_id": "SAMPLE001",
       "employee_name": "山田 太郎",
       "dept_name": "株式会社マネーフォワード > ビジネスセグメント_ERPドメイン > ...",
       ...
     },
     ...
   ]
   ```

### Step 4: Verify the Data

The application will automatically:
- Parse `dept_name` (hierarchical format) into `dept_1`, `dept_2`, `dept_3`, etc. for backward compatibility
- Handle all the array fields (pulse_survey_history, ggi_history, etc.)
- Support all fields from the BigQuery schema

## Schema Overview

### Basic Fields (Scalar Values)
- **Identification**: employee_id, employee_name, employee_name_kana, nickname, mail
- **Employment**: current_employee_flag, employment_type, entered_at, years_of_service, etc.
- **Personal**: gender, birthday, age, nationality
- **Organizational**: dept_name (hierarchical), location, job_title, job_family, job_family_detail
- **Compensation**: salary_table, latest_job_grade, latest_org_grade, annual_salary
- **FFS**: ffs_a_factor through ffs_e_factor, ffs_type, ffs_concat_text
- **Other**: jp_non_jp_classification, self_introduction, kaonavi_url

### Array Fields (Historical Data)
- **pulse_survey_history**: Pulse survey scores over time
- **ggi_history**: Half-year goal history
- **ggi_monthly_history**: Monthly review history
- **evaluation_history**: Performance evaluation history
- **activity_history**: Attendance and activity data
- **transfer_history**: Department transfer history
- **grade_retention_history**: Job grade retention periods

## Important Notes

1. **Department Format**: The BigQuery schema uses `dept_name` as a single hierarchical string (e.g., "Company > Division > Department"). The application automatically converts this to `dept_1`, `dept_2`, `dept_3`, etc. for backward compatibility.

2. **Array Fields**: All array fields may be `null` if there's no historical data for an employee. The application handles this gracefully.

3. **Date Format**: All dates are in `YYYY-MM-DD` format.

4. **Current Employee Flag**: Use `"●"` for active employees, empty string `""` for retired employees.

5. **Data Size**: The full dataset is ~192MB with ~2,463 employees. Make sure your JSON file is valid before copying.

## Troubleshooting

### JSON Validation
Before copying the file, validate it:
```bash
python -m json.tool employees_export.json > /dev/null
```

### Common Issues

1. **Invalid JSON**: Make sure the export is valid JSON (not CSV or other format)
2. **Missing Fields**: Some fields may be `null` - this is expected
3. **Array Format**: Array fields should be JSON arrays `[]`, not strings
4. **Encoding**: Ensure the file is UTF-8 encoded

## Quick Copy Command

If you have the exported file ready:
```bash
# Replace with your actual export file path
cp /path/to/bigquery_export.json backend/mock-data/employees/employees.json
```

