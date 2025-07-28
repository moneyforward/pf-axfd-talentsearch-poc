package vertex

import (
	"context"
	"log"
	"os"

	discoveryengine "cloud.google.com/go/discoveryengine/apiv1"
	"cloud.google.com/go/discoveryengine/apiv1/discoveryenginepb"
	"google.golang.org/api/option"
	"jp.co.moneyforward/pf-skillsearch/schema"
)

type VertexAISearch struct {
	apiVersion    string
	apiKey        string
	servingConfig string
}

func NewVertexAISearch(apiKey string, location string) (*VertexAISearch, error) {
	var servingConfig = "projects/" + os.Getenv("GOOGLE_CLOUD_PROJECT")
	servingConfig += "/locations/" + location
	servingConfig += "/collections/default_collection"
	servingConfig += "/engines/" + os.Getenv("GOOGLE_CLOUD_ENGINE")
	servingConfig += "/servingConfigs/default_search"

	// projects/'218635233545'/locations/us/collections/default_collection/engines/pf-ai-app-skillsearch_1753251538165/servingConfigs/default_search
	// curl -X POST -H "Authorization: Bearer $(gcloud auth print-access-token)" \
	// -H "Content-Type: application/json" \
	// "https://us-discoveryengine.googleapis.com
	// /v1alpha
	// /projects/218635233545
	// /locations/us
	// /collections/default_collection
	// /engines/pf-ai-app-skillsearch_1753251538165
	// /servingConfigs/default_search:search" \
	// -d '{"query":"tokugami","pageSize":10,"spellCorrectionSpec":{"mode":"AUTO"},"languageCode":"ja","userInfo":{"timeZone":"Asia/Tokyo"},"contentSearchSpec":{"snippetSpec":{"returnSnippet":true}}}'

	vertexAI := &VertexAISearch{
		apiVersion:    "v1",
		apiKey:        apiKey,
		servingConfig: servingConfig,
		// projects/PROJECT_ID/locations/global/collections/default_collection/engines/APP_ID/servingConfigs/default_search
	}
	return vertexAI, nil
}

func (s *VertexAISearch) client() (*discoveryengine.SearchClient, error) {
	ctx := context.Background()

	log.Println("servingConfig:", s.servingConfig)
	if os.Getenv("GOOGLE_APPLICATION_CREDENTIALS") == "" {
		c, err := discoveryengine.NewSearchClient(ctx)
		if err != nil {
			log.Fatalf("Failed to create discovery engine client: %v", err)
			return nil, err
		}
		return c, nil
	} else {
		log.Println("Credentials file:", os.Getenv("GOOGLE_APPLICATION_CREDENTIALS"))
		c, err := discoveryengine.NewSearchClient(ctx,
			option.WithCredentialsFile(os.Getenv("GOOGLE_APPLICATION_CREDENTIALS")),
		)
		if err != nil {
			log.Fatalf("Failed to create discovery engine client: %v", err)
			return nil, err
		}
		return c, nil
	}

}
func (s *VertexAISearch) FindPerson(persona schema.PFSkillSearchModelsPersona) ([]schema.PFSkillSearchModelsPerson, error) {
	// Implement the logic to find a person based on the provided schema.PFSkillSearchModelsPersona
	// This function should interact with the Vertex AI Search API to find matching persons.
	c, err := s.client()
	if err != nil {
		log.Printf("Failed to create discovery engine client: %v", err)
	}

	defer c.Close()
	log.Println("Finding person with persona:", s.apiKey)
	// Implement the search logic here using the discoveryengine client
	// For example, you can use the Search method with the appropriate request parameters.
	// This is a placeholder for the actual search logic.
	// You would typically create a SearchRequest, set the necessary parameters, and call the Search
	iter := c.Search(context.Background(), &discoveryenginepb.SearchRequest{
		ServingConfig: s.servingConfig + ":search",
		Query:         persona.Name,
		PageSize:      10,
		LanguageCode:  "ja",
	})
	var results []schema.PFSkillSearchModelsPerson

	for {
		resp, err := iter.Next()
		if err != nil {
			if err.Error() == "no more items in iterator" {
				break
			}
			log.Printf("Error getting next search result: %v", err)
			return nil, err
		}
		log.Printf("Found document: %v", resp.Document)
		// ここでschema.PFSkillSearchModelsPersonに変換してappend
		// results = append(results, person)
	}
	return results, nil
}

func (s *VertexAISearch) SearchPeople(query string) ([]schema.PFSkillSearchModelsPerson, error) {
	c, err := s.client()
	if err != nil {
		return nil, err
	}
	defer c.Close()
	log.Println("Searching for people with query:", query)
	req := &discoveryenginepb.SearchRequest{
		ServingConfig: s.servingConfig + ":search",
		Query:         query,
		PageSize:      10,
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

	for {
		resp, err := iter.Next()
		if err != nil {
			if err.Error() == "no more items in iterator" {
				break
			}
			log.Printf("Error getting next search result: %v", err)
			return nil, err
		}
		log.Printf("Found document: %v", resp.Document)
		// ここでschema.PFSkillSearchModelsPersonに変換してappend
		// results = append(results, person)
	}
	return results, nil
}
