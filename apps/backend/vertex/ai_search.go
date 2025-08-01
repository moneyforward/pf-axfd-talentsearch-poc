package vertex

import (
	"context"
	"errors"
	"log"
	"os"
	"strings"

	discoveryengine "cloud.google.com/go/discoveryengine/apiv1"
	"cloud.google.com/go/discoveryengine/apiv1/discoveryenginepb"
	"google.golang.org/api/option"
	"google.golang.org/protobuf/types/known/structpb"
	"jp.co.moneyforward/pf-skillsearch/schema"
)

type DATASTORE string

const (
	DS_HALF_REVIEW    DATASTORE = "pf-ai-app-half-review_1753251488660"
	DS_MONTHLY_REVIEW DATASTORE = "pf-ai-app-monthly-review_1753251177238"
	DS_EMPLOYEE_INFO  DATASTORE = "pf-ai-app-employee-info_1753251393945"
	DS_RESUME         DATASTORE = "pf-ai-app-resume_1753250812679"
	DS_CV             DATASTORE = "pf-ai-app-cv_1751509417434"
	DS_RESUME_META    DATASTORE = "pf-ai-app-resume-meta_1753839476435"
	DS_CV_META        DATASTORE = "pf-ai-app-cv-meta_1753839539545"
	DS_ALL            DATASTORE = "ALL________"
)

func servingConfig(
	location string,
	collection string,
	ds DATASTORE) string {

	var config = "projects/" + os.Getenv("GOOGLE_CLOUD_PROJECT")
	config += "/locations/" + location
	config += "/collections/" + collection
	if ds == DS_ALL {
		config += "/engines/" + os.Getenv("GOOGLE_CLOUD_ENGINE")
	} else {
		config += "/dataStores/" + string(ds)
	}
	config += "/servingConfigs/default_search"
	return config
}

type VertexAISearch struct {
	apiVersion string
	apiKey     string
	csClient   *CloudStorage
}

func NewVertexAISearch(apiKey string, location string, ds DATASTORE) (*VertexAISearch, error) {

	vertexAI := &VertexAISearch{
		apiVersion: "v1",
		apiKey:     apiKey,
		csClient:   NewCloudStorage(),
	}
	return vertexAI, nil
}

func (s *VertexAISearch) client() (*discoveryengine.SearchClient, error) {
	ctx := context.Background()

	if os.Getenv("GOOGLE_APPLICATION_CREDENTIALS") == "" {
		c, err := discoveryengine.NewSearchClient(ctx,
			option.WithEndpoint("us-discoveryengine.googleapis.com:443"),
		)
		if err != nil {
			log.Fatalf("Failed to create discovery engine client: %v", err)
			return nil, err
		}
		return c, nil
	} else {
		log.Println("Credentials file:", os.Getenv("GOOGLE_APPLICATION_CREDENTIALS"))
		c, err := discoveryengine.NewSearchClient(ctx,
			option.WithEndpoint("us-discoveryengine.googleapis.com:443"),
			option.WithCredentialsFile(os.Getenv("GOOGLE_APPLICATION_CREDENTIALS")),
		)
		if err != nil {
			log.Fatalf("Failed to create discovery engine client: %v", err)
			return nil, err
		}
		return c, nil
	}

}
func (s *VertexAISearch) FindPerson(
	// person schema.PFSkillSearchModelsPerson,
	persona schema.PFSkillSearchModelsPersona,
) ([]schema.PFSkillSearchModelsPerson, error) {
	c, err := s.client()
	if err != nil {
		log.Printf("Failed to create discovery engine client: %v", err)
	}
	defer c.Close()

	var query string
	log.Println("Generating query for persona:", persona)
	for _, skill := range persona.Skills {
		query += skill.Name + " "
	}

	log.Println("Searching for people with query:", query)

	iter := c.Search(context.Background(), &discoveryenginepb.SearchRequest{
		ServingConfig: servingConfig("us", "default_collection", DS_ALL) + ":search",
		Query:         query,
		PageSize:      10,
		LanguageCode:  "ja",
	})

	var results []schema.PFSkillSearchModelsPerson
	var counter = 0
	var employeeIds []string
	for counter < 12 {
		counter++
		resp, err := iter.Next()
		if err != nil {
			if err.Error() == "no more items in iterator" {
				break
			}
			log.Printf("Error getting next search result: %v", err)
			return nil, err
		}
		// log.Println("===========================================================================")
		// log.Printf("Found document: %v", resp.Document)
		// log.Printf("ModelScores: %v\n", resp.ModelScores)
		// log.Printf("Chunk: %v\n", resp.Chunk)
		// log.Printf("Document ID: %v\n", resp.Document.Name)
		// projects/218635233545/locations/us/collections/default_collection/dataStores/pf-ai-app-half-review_1753251488660/branches/0/documents/484e6943c6d4c81fb43f9fb66a800f2b
		serving := strings.Split(resp.Document.Name, "/")
		var dataStore string
		for i, v := range serving {
			if v == "dataStores" {
				dataStore = serving[i+1]
				break
			}
		}

		if dataStore == string(DS_EMPLOYEE_INFO) {
			// log.Printf("Skipping document from dataStore: %v", dataStore)
			results = append(results, parsePerson(resp))
		} else if dataStore == string(DS_HALF_REVIEW) {
			// Handle DS_HALF_REVIEW case
			halfReview := parseHalfReview(resp)
			if !contains(employeeIds, halfReview.EmployeeId) {
				employeeIds = append(employeeIds, halfReview.EmployeeId)
			}
		} else if dataStore == string(DS_MONTHLY_REVIEW) {
			// Handle DS_MONTHLY_REVIEW case
			monthlyReview := parseMonthlyReview(resp)
			if !contains(employeeIds, monthlyReview.EmployeeId) {
				employeeIds = append(employeeIds, monthlyReview.EmployeeId)
			}
		} else {
			log.Printf("Skipping document from dataStore: %v", dataStore)
			continue // Skip other dataStores
		}
	}
	if len(employeeIds) > 0 {
		employeeInfos, err := s.csClient.EmployeeInfo(employeeIds)
		if err != nil {
			log.Printf("Failed to get employee info: %v", err)
		}
		results = append(results, employeeInfos...)
	}
	return results, nil
}

func getStringOrEmpty(fields map[string]*structpb.Value, key string) string {
	if val, ok := fields[key]; ok {
		return val.GetStringValue()
	}
	return ""
}

func getStringPointerOrNil(fields map[string]*structpb.Value, key string) *string {
	if val, ok := fields[key]; ok {
		s := val.GetStringValue()
		return &s
	}
	return nil
}

func (s *VertexAISearch) GeneratePersona(
	halfreview schema.PFSkillSearchModelsHalfReview,
	monthlyreview schema.PFSkillSearchModelsMonthlyReview,
) {

}

// func (s *VertexAISearch) GetCV(employee schema.PFSkillSearchModelsPerson) (string, error) {
// 	c, err := s.client()
// 	if err != nil {
// 		log.Printf("Failed to create discovery engine client: %v", err)
// 		return "", err
// 	}
// 	defer c.Close()
// 	log.Println("Searching for CV with query:", employee.EmployeeId)
// 	req := &discoveryenginepb.SearchRequest{
// 		ServingConfig: s.servingConfig + ":search",
// 		Query:         employee.EmployeeName + " " + employee.EmployeeId,
// 		PageSize:      5,
// 		LanguageCode:  "ja",
// 	}
// 	iter := c.Search(context.Background(), req)
// 	var counter = 0
// 	for counter < 1 {
// 		counter++
// 		resp, err := iter.Next()
// 		if err != nil {
// 			if err.Error() == "no more items in iterator" {
// 				break
// 			}
// 			log.Printf("Error getting next search result: %v", err)
// 			return "", err
// 		}

// 		structData := resp.Document.GetStructData()
// 		log.Printf("Found document.GetStructData: %v\n", resp)
// 		log.Printf("Found document.GetStructData: %v\n", structData)
// 		log.Printf("Found document.AsMap: %v\n", structData.AsMap())
// 		log.Printf("Found document.String(): %v\n", resp.Document.String())
// 		// ここでschema.PFSkillSearchModelsPersonに変換してappend
// 		cvUrl := getStringOrEmpty(structData.Fields, "cv_url")
// 		if cvUrl != "" {
// 			return cvUrl, nil
// 		}
// 	}
// }

func (s *VertexAISearch) SearchPeople(query string) ([]schema.PFSkillSearchModelsPerson, error) {
	c, err := s.client()
	if err != nil {
		return nil, err
	}
	defer c.Close()
	log.Println("Searching for people with query:", query)
	req := &discoveryenginepb.SearchRequest{
		ServingConfig: servingConfig("us", "default_collection", DS_EMPLOYEE_INFO) + ":search",
		Query:         query,
		PageSize:      5,
		LanguageCode:  "ja",
		UserInfo: &discoveryenginepb.UserInfo{
			TimeZone: "Asia/Tokyo",
		},
		SpellCorrectionSpec: &discoveryenginepb.SearchRequest_SpellCorrectionSpec{
			Mode: discoveryenginepb.SearchRequest_SpellCorrectionSpec_AUTO,
		},
		ContentSearchSpec: &discoveryenginepb.SearchRequest_ContentSearchSpec{
			SnippetSpec: &discoveryenginepb.SearchRequest_ContentSearchSpec_SnippetSpec{
				ReturnSnippet: false,
			},
		},
	}

	iter := c.Search(context.Background(), req)

	var results []schema.PFSkillSearchModelsPerson
	var counter = 0
	for {
		if counter >= 5 { // Limit to 5 results
			break
		}
		counter++
		resp, err := iter.Next()
		if err != nil {
			if err.Error() == "no more items in iterator" {
				break
			}
			log.Printf("Error getting next search result: %v", err)
			return nil, err
		}
		// log.Printf("Found document.GetStructData: %v\n", structData)
		// log.Printf("Found document.AsMap: %v\n", structData.AsMap())
		// log.Printf("Found document.String(): %v\n", resp.Document.String())
		// ここでschema.PFSkillSearchModelsPersonに変換してappend
		person := parsePerson(resp)
		results = append(results, person)
		// results = append(results, person)

	}
	return results, nil
}

func (s *VertexAISearch) GetHalfReview(employeeId string) (schema.PFSkillSearchModelsHalfReview, error) {
	c, err := s.client()
	if os.Getenv("GOOGLE_CLOUD_PROJECT") == "" {
		log.Println("GOOGLE_CLOUD_PROJECT is not set, using default project")
		return schema.PFSkillSearchModelsHalfReview{}, errors.New("GOOGLE_CLOUD_PROJECT is not set")
	}
	servingConfig := servingConfig("us", "default_collection", DS_HALF_REVIEW)
	if err != nil {
		log.Printf("Failed to create discovery engine client: %v", err)
		return schema.PFSkillSearchModelsHalfReview{}, err
	}
	defer c.Close()
	log.Println("Searching for Half Review with query:", employeeId)
	req := &discoveryenginepb.SearchRequest{
		ServingConfig: servingConfig + ":search",
		Query:         employeeId,
		PageSize:      5,
		LanguageCode:  "ja",
		// Filter:        `employee_id = \"` + employeeId + `\"`,
		// FacetSpecs: []*discoveryenginepb.SearchRequest_FacetSpec{
		// 	{
		// 		FacetKey: &discoveryenginepb.SearchRequest_FacetSpec_FacetKey{
		// 			Key:              "employee_id",
		// 			RestrictedValues: []string{employeeId},
		// 		},
		// 		Limit: 2, // Limit to 2 results
		// 	},
		// },
	}
	iter := c.Search(context.Background(), req)
	var counter = 0
	for counter < 5 {
		counter++
		resp, err := iter.Next()
		if err != nil {
			if err.Error() == "no more items in iterator" {
				break
			}
			log.Printf("Error getting next search result: %v", err)
			return schema.PFSkillSearchModelsHalfReview{}, err
		}
		structData := resp.Document.GetStructData()
		if getStringOrEmpty(structData.Fields, "employee_id") != employeeId {
			continue // Skip if the employee_id does not match
		}
		review := schema.PFSkillSearchModelsHalfReview{
			EmployeeId:                          getStringOrEmpty(structData.Fields, "employee_id"),
			HalfYearSelfReviewAchievementGrowth: getStringOrEmpty(structData.Fields, "half_year_self_review_achievement_growth"),
			SelfAssessmentScore:                 getStringOrEmpty(structData.Fields, "self_assessment_score"),
			MedTerm23yr:                         getStringOrEmpty(structData.Fields, "med_term_2_3yr"),
			ShortTerm1yr:                        getStringOrEmpty(structData.Fields, "short_term_1yr"),
		}
		return review, nil
	}
	return schema.PFSkillSearchModelsHalfReview{}, nil
}

func (s *VertexAISearch) GetMonthlyReview(employeeId string) (schema.PFSkillSearchModelsMonthlyReview, error) {
	c, err := s.client()
	if os.Getenv("GOOGLE_CLOUD_PROJECT") == "" {
		log.Println("GOOGLE_CLOUD_PROJECT is not set, using default project")
		return schema.PFSkillSearchModelsMonthlyReview{}, errors.New("GOOGLE_CLOUD_PROJECT is not set")
	}
	servingConfig := servingConfig("us", "default_collection", DS_MONTHLY_REVIEW)
	if err != nil {
		log.Printf("Failed to create discovery engine client: %v", err)
		return schema.PFSkillSearchModelsMonthlyReview{}, err
	}
	defer c.Close()
	log.Println("Searching for Monthly Review with query:", employeeId)
	req := &discoveryenginepb.SearchRequest{
		ServingConfig: servingConfig + ":search",
		Query:         employeeId,
		PageSize:      5,
		LanguageCode:  "ja",
		Filter:        `employee_id = "` + employeeId + `"`,
		// FacetSpecs: []*discoveryenginepb.SearchRequest_FacetSpec{
		// 	{
		// 		FacetKey: &discoveryenginepb.SearchRequest_FacetSpec_FacetKey{
		// 			Key:              "employee_id",
		// 			RestrictedValues: []string{employeeId},
		// 		},
		// 		Limit: 2, // Limit to 2 results
		// 	},
		// },
	}
	iter := c.Search(context.Background(), req)
	var counter = 0
	for counter < 5 {
		counter++
		resp, err := iter.Next()
		if err != nil {
			if err.Error() == "no more items in iterator" {
				break
			}
			log.Printf("Error getting next search result: %v", err)
			return schema.PFSkillSearchModelsMonthlyReview{}, err
		}
		structData := resp.Document.GetStructData()
		if getStringOrEmpty(structData.Fields, "employee_id") != employeeId {
			continue // Skip if the employee_id does not match
		}
		// ここでschema.PFSkillSearchModelsMonthlyReviewに変換してappend
		review := schema.PFSkillSearchModelsMonthlyReview{
			EmployeeId:    getStringOrEmpty(structData.Fields, "employee_id"),
			MonthlyGoal:   getStringOrEmpty(structData.Fields, "monthly_goal"),
			MonthlyReview: getStringOrEmpty(structData.Fields, "monthly_review"),
		}
		return review, nil
	}
	return schema.PFSkillSearchModelsMonthlyReview{}, nil
}

func parseMonthlyReview(resp *discoveryenginepb.SearchResponse_SearchResult) schema.PFSkillSearchModelsMonthlyReview {
	structData := resp.Document.GetStructData()
	// log.Printf("Found document.GetStructData: %v\n", structData)
	// log.Printf("Found document.AsMap: %v\n", structData.AsMap())
	// log.Printf("Found document.String(): %v\n", resp.Document.String())
	return schema.PFSkillSearchModelsMonthlyReview{
		EmployeeId:    getStringOrEmpty(structData.Fields, "employee_id"),
		MonthlyGoal:   getStringOrEmpty(structData.Fields, "monthly_goal"),
		MonthlyReview: getStringOrEmpty(structData.Fields, "monthly_review"),
	}
}

func parseHalfReview(resp *discoveryenginepb.SearchResponse_SearchResult) schema.PFSkillSearchModelsHalfReview {
	structData := resp.Document.GetStructData()
	// log.Printf("Found document.GetStructData: %v\n", structData)
	// log.Printf("Found document.AsMap: %v\n", structData.AsMap())
	// log.Printf("Found document.String(): %v\n", resp.Document.String())
	return schema.PFSkillSearchModelsHalfReview{
		EmployeeId:                          getStringOrEmpty(structData.Fields, "employee_id"),
		HalfYearSelfReviewAchievementGrowth: getStringOrEmpty(structData.Fields, "half_year_self_review_achievement_growth"),
		SelfAssessmentScore:                 getStringOrEmpty(structData.Fields, "self_assessment_score"),
		MedTerm23yr:                         getStringOrEmpty(structData.Fields, "med_term_2_3yr"),
		ShortTerm1yr:                        getStringOrEmpty(structData.Fields, "short_term_1yr"),
		CycleStartDate:                      getStringOrEmpty(structData.Fields, "cycle_start_date"),
		EmploymentType:                      getStringOrEmpty(structData.Fields, "employment_type"),
		FyCycle:                             getStringOrEmpty(structData.Fields, "fy_cycle"),
		JobFamily:                           getStringOrEmpty(structData.Fields, "job_family"),
		Org1:                                getStringOrEmpty(structData.Fields, "org1"),
		Org2:                                getStringOrEmpty(structData.Fields, "org2"),
		RowNum:                              getStringOrEmpty(structData.Fields, "row_num"),
		UploadYearMonth:                     getStringOrEmpty(structData.Fields, "upload_year_month"),
	}
}

func parsePerson(resp *discoveryenginepb.SearchResponse_SearchResult) schema.PFSkillSearchModelsPerson {
	structData := resp.Document.GetStructData()
	// log.Printf("Found document.GetStructData: %v\n", structData)
	// log.Printf("Found document.AsMap: %v\n", structData.AsMap())
	// log.Printf("Found document.String(): %v\n", resp.Document.String())
	// ここでschema.PFSkillSearchModelsPersonに変換してappend
	person := schema.PFSkillSearchModelsPerson{
		EmployeeId:            getStringOrEmpty(structData.Fields, "employee_id"),
		EmployeeName:          getStringOrEmpty(structData.Fields, "employee_name"),
		Age:                   getStringOrEmpty(structData.Fields, "age"),
		Birthday:              getStringOrEmpty(structData.Fields, "birthday"),
		CurrentEmployeeFlag:   getStringOrEmpty(structData.Fields, "current_employee_flag"),
		Dept1:                 getStringOrEmpty(structData.Fields, "dept_1"),
		Dept2:                 getStringOrEmpty(structData.Fields, "dept_2"),
		Dept3:                 getStringPointerOrNil(structData.Fields, "dept_3"),
		Dept4:                 getStringPointerOrNil(structData.Fields, "dept_4"),
		Dept5:                 getStringPointerOrNil(structData.Fields, "dept_5"),
		Dept6:                 getStringPointerOrNil(structData.Fields, "dept_6"),
		EmploymentCategory:    getStringPointerOrNil(structData.Fields, "employment_category"),
		EmploymentType:        getStringOrEmpty(structData.Fields, "employment_type"),
		EnteredAt:             getStringOrEmpty(structData.Fields, "entered_at"),
		Gender:                getStringOrEmpty(structData.Fields, "gender"),
		GradeCombined:         getStringPointerOrNil(structData.Fields, "grade_combined"),
		JobFamily:             getStringOrEmpty(structData.Fields, "job_family"),
		JpNonJpClassification: getStringOrEmpty(structData.Fields, "jp_non_jp_classification"),
		JobTitle:              getStringOrEmpty(structData.Fields, "job_title"),
		Mail:                  getStringOrEmpty(structData.Fields, "mail"),
		YearsOfService:        getStringOrEmpty(structData.Fields, "years_of_service"),
		SalaryTable:           getStringOrEmpty(structData.Fields, "salary_table"),
	}
	return person

}
