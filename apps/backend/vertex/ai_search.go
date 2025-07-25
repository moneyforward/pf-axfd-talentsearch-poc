package vertex

import (
	"context"
	"log"

	discoveryengine "cloud.google.com/go/discoveryengine/apiv1"
	"cloud.google.com/go/discoveryengine/apiv1/discoveryenginepb"
	"google.golang.org/api/option"
	"jp.co.moneyforward/pf-skillsearch/schema"
)

type VertexAISearch struct {
	apiVersion string
	project    string
	location   string
	apiKey     string
}

func NewVertexAISearch(apiKey, project, location string) (*VertexAISearch, error) {
	vertexAI := &VertexAISearch{
		apiVersion: "v1",
		project:    project,
		location:   "us",
		apiKey:     apiKey,
	}
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
	return vertexAI, nil
}

func (s *VertexAISearch) client() (*discoveryengine.SearchClient, error) {
	ctx := context.Background()
	c, err := discoveryengine.NewSearchClient(ctx, option.WithAPIKey(
		s.apiKey,
	))
	if err != nil {
		log.Fatalf("Failed to create discovery engine client: %v", err)
		return nil, err
	}
	return c, nil
}

func (s *VertexAISearch) SearchPeople(query string) ([]schema.PFSkillSearchModelsPerson, error) {
	c, err := s.client()
	if err != nil {
		return nil, err
	}
	defer c.Close()
	log.Println("Searching for people with query:", query)
	req := &discoveryenginepb.SearchRequest{
		ServingConfig: "projects/" + s.project + "/locations/" + s.location + "/collections/default_collection/engines/pf-ai-app-skillsearch_1753251538165/servingConfigs/default_search:search",
		Query:         query,
		PageSize:      10,
		LanguageCode:  "ja",
		UserInfo: &discoveryenginepb.UserInfo{
			UserId:   "user-1234", // 必須ではないが推奨
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
