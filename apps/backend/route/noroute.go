package route

import (
	"path"
	"path/filepath"

	"github.com/gin-gonic/gin"
)

// APIとして定義されていないパスにアクセスされた場合、frontendのindex.htmlを返す
func Frontend(c *gin.Context) {
	_, file := path.Split(c.Request.RequestURI)
	ext := filepath.Ext(file)
	//ディレクトリアクセス（ファイル名がない）かパスクエリ（拡張子がない）
	if file == "" || ext == "" {
		c.File("../frontend/dist" + "/index.html")
	} else {
		c.File("../frontend/dist" + c.Request.RequestURI)
	}
}
