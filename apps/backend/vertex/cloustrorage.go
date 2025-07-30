package vertex

import (
	"bufio"
	"bytes"
	"context"
	"encoding/json"
	"image"
	"io"
	"log"

	"cloud.google.com/go/storage"
	"jp.co.moneyforward/pf-skillsearch/schema"
)

type CloudStorage struct {
}

func NewCloudStorage() *CloudStorage {
	return &CloudStorage{}
}

func (cs *CloudStorage) client() (*storage.Client, error) {
	ctx := context.Background()
	client, err := storage.NewClient(ctx)
	if err != nil {
		log.Fatalf("Failed to create cloud storage client: %v", err)
		return nil, err
	}
	return client, nil
}

const (
	HALF_REVIEW_FILE    = "stg_kaonavi_smart_review_half_year_review.json"
	MONTHLY_REVIEW_FILE = "stg_kaonavi_smart_review_monthly_review.json"
	EMPLOYEE_INFO_FILE  = "kaoanavi_employee_info.jsonl.json"
)

func (cs *CloudStorage) HalfReview(employee_id string) (schema.PFSkillSearchModelsHalfReview, error) {
	client, err := cs.client()
	if err != nil {
		return schema.PFSkillSearchModelsHalfReview{}, err
	}

	// Assuming the container name is "half-review-files" and the blob name is employee_id + ".json"
	bucket := client.Bucket("pf_ai_app")
	blob := bucket.Object(HALF_REVIEW_FILE)
	// blobのJSONLを読み込み、1行ずつemployee_idを比較し、マッチするものを返す。
	// read the blob
	reader, err := blob.NewReader(context.Background())
	if err != nil {
		return schema.PFSkillSearchModelsHalfReview{}, err
	}
	defer reader.Close()

	// Read the data line by line
	scanner := bufio.NewScanner(reader)
	for scanner.Scan() {
		line := scanner.Bytes()
		var halfReview schema.PFSkillSearchModelsHalfReview
		json.Unmarshal(line, &halfReview)

		if halfReview.EmployeeId == employee_id {
			return halfReview, nil
		}
	}

	if err := scanner.Err(); err != nil {
		return schema.PFSkillSearchModelsHalfReview{}, err
	}

	return schema.PFSkillSearchModelsHalfReview{}, nil
}

func (cs *CloudStorage) MonthlyReview(employee_id string) (schema.PFSkillSearchModelsMonthlyReview, error) {
	client, err := cs.client()
	if err != nil {
		return schema.PFSkillSearchModelsMonthlyReview{}, err
	}

	// Assuming the container name is "monthly-review-files" and the blob name is employee_id + ".json"
	bucket := client.Bucket("pf_ai_app")
	blob := bucket.Object(MONTHLY_REVIEW_FILE)
	// blobのJSONLを読み込み、1行ずつemployee_idを比較し、マッチするものを返す。
	// read the blob
	reader, err := blob.NewReader(context.Background())
	if err != nil {
		return schema.PFSkillSearchModelsMonthlyReview{}, err
	}
	defer reader.Close()

	// Read the data line by line
	scanner := bufio.NewScanner(reader)
	for scanner.Scan() {
		line := scanner.Bytes()
		var monthlyReview schema.PFSkillSearchModelsMonthlyReview
		json.Unmarshal(line, &monthlyReview)

		if monthlyReview.EmployeeId == employee_id {
			return monthlyReview, nil
		}
	}

	if err := scanner.Err(); err != nil {
		return schema.PFSkillSearchModelsMonthlyReview{}, err
	}

	return schema.PFSkillSearchModelsMonthlyReview{}, nil
}

func (cs *CloudStorage) IsExistsCV(employee_id string) (bool, error) {
	client, err := cs.client()
	if err != nil {
		return false, err
	}

	// Assuming the container name is "cv-files" and the blob name is personID + ".pdf"
	bucket := client.Bucket("pf_ai_app")
	blob := bucket.Object("職務経歴書/" + employee_id + "_職務経歴書.pdf")

	// Check if the blob exists
	_, err = blob.Attrs(context.Background())
	if err != nil {
		if storage.ErrObjectNotExist == err {
			return false, nil // CV does not exist
		}
		return false, err // Other error
	}

	return true, nil // CV exists
}

func (cs *CloudStorage) IsExistsResume(personID string) (bool, error) {
	client, err := cs.client()
	if err != nil {
		return false, err
	}

	// Assuming the container name is "resume-files" and the blob name is personID + ".pdf"
	bucket := client.Bucket("pf_ai_app")
	blob := bucket.Object("履歴書/" + personID + "_R.pdf")

	// Check if the blob exists
	_, err = blob.Attrs(context.Background())
	if err != nil {
		if storage.ErrObjectNotExist == err {
			return false, nil // Resume does not exist
		}
		return false, err // Other error
	}

	return true, nil // Resume exists
}

func (cs *CloudStorage) GetFaceImage(personID string) (image.Image, error) {
	client, err := cs.client()
	if err != nil {
		return nil, err
	}

	// Assuming the container name is "face-images" and the blob name is personID + ".jpg"
	bucket := client.Bucket("pf_ai_app")
	blob := bucket.Object("photos/" + personID + ".jpg")

	// Get the reader for the blob
	reader, err := blob.NewReader(context.Background())
	if err != nil {
		return nil, err
	}
	defer reader.Close()

	// Read the image data
	imgData, err := io.ReadAll(reader)
	if err != nil {
		return nil, err
	}

	// Decode the image
	img, _, err := image.Decode(bytes.NewReader(imgData))
	if err != nil {
		return nil, err
	}

	// Return the image
	return img, nil
}
