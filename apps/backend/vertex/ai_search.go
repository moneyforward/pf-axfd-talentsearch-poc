package vertex

import (
	"bytes"
	"encoding/json"
	"fmt"
	"net/http"
)

type SearchRequest struct {
	Query               string                           `json:"query"`
	PageSize            int                              `json:"pageSize"`
	SpellCorrectionSpec SearchRequestSpellCorrectionSpec `json:"spellCorrectionSpec"`
	LanguageCode        string                           `json:"languageCode"`
	UserInfo            SearchRequestUserInfo            `json:"userInfo"`
	ContentSearchSpec   SearchRequestContentSearchSpec   `json:"contentSearchSpec"`
}

type SearchRequestSpellCorrectionSpec struct {
	Mode string `json:"mode"`
}
type SearchRequestUserInfo struct {
	TimeZone string `json:"timeZone"`
}
type SearchRequestContentSearchSpec struct {
	SnippetSpec SearchRequestSnippetSpec `json:"snippetSpec"`
}
type SearchRequestSnippetSpec struct {
	ReturnSnippet bool `json:"returnSnippet"`
}

type VertexAISearch struct {
	apiVersion string
	project    string
	location   string
	apiKey     string
	client     *http.Client
}

func NewVertexAISearch(apiKey, project, location string) (*VertexAISearch, error) {
	client := &http.Client{}
	vertexAI := &VertexAISearch{
		apiVersion: "v1",
		project:    project,
		location:   "us",
		apiKey:     apiKey,
		client:     client,
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
func (s *VertexAISearch) getUrl() string {
	var url = "https://"
	if s.location != "global" {
		url += s.location + "-"
	}
	url += "discoveryengine.googleapis.com/"
	url += s.apiVersion
	url += "/projects/" + s.project
	url += "/locations/" + s.location
	url += "/collections/default_collection/"
	url += "engines/talentsearch_1752025636546"
	url += "/servingConfigs"
	return url
}

func (s *VertexAISearch) POST(url string, payload any) (*SearchRequest, error) {
	payloadBytes, err := json.Marshal(payload)
	if err != nil {
		return nil, fmt.Errorf("failed to marshal payload: %w", err)
	}
	req, err := http.NewRequest("POST", url, bytes.NewBuffer(payloadBytes))
	if err != nil {
		return nil, fmt.Errorf("failed to create request: %w", err)
	}
	req.Header.Set("Content-Type", "application/json")
	req.Header.Set("Authorization", "Bearer "+s.apiKey)
}

func (s *VertexAISearch) SearchPeople(query string) ([]string, error) {
	searchRequest := SearchRequest{
		Query:    query,
		PageSize: 10,
		SpellCorrectionSpec: SearchRequestSpellCorrectionSpec{
			Mode: "AUTO",
		},
		LanguageCode: "ja",
		UserInfo: SearchRequestUserInfo{
			TimeZone: "Asia/Tokyo",
		},
		ContentSearchSpec: SearchRequestContentSearchSpec{
			SnippetSpec: SearchRequestSnippetSpec{
				ReturnSnippet: true,
			},
		},
	}

	url := s.getUrl() + "/default_search:search"
	s.POST(url, searchRequest)

	// {"query":"tokugami",
	// "pageSize":10,
	// "spellCorrectionSpec":{"mode":"AUTO"},
	// "languageCode":"ja",
	// "userInfo":{"timeZone":"Asia/Tokyo"},
	// "contentSearchSpec":{"snippetSpec":{"returnSnippet":true}}}

	return nil, nil
}
