package vertex

import (
	"context"
	"fmt"

	discoveryengine "cloud.google.com/go/discoveryengine/apiv1"
	"cloud.google.com/go/discoveryengine/apiv1/discoveryenginepb"
)

type VertexAISearch struct {
	apiVersion string
	project    string
	location   string
	apiKey     string
	client     *discoveryengine.SearchClient
}

func NewVertexAISearch(apiKey, project, location string) (*VertexAISearch, error) {
	c, err := discoveryengine.NewSearchClient(context.Background())
	if err != nil {
		return nil, fmt.Errorf("failed to create discovery engine client: %w", err)
	}
	defer c.Close()
	c.Search(context.Background(), &discoveryenginepb.SearchRequest{
		Query: "example query",
	})

	vertexAI := &VertexAISearch{
		apiVersion: "v1",
		project:    project,
		location:   "us",
		apiKey:     apiKey,
		client:     c,
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

func (s *VertexAISearch) SearchPeople(query string) ([]string, error) {
	res := s.client.Search(context.Background(), &discoveryenginepb.SearchRequest{
		Query:    query,
		PageSize: 10,
	})
	for _, v := range res.All() {
		// Process each result
		fmt.Println(v)
	}
	return nil, nil
}
