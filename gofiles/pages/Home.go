package pages

import (
	"html/template"
	"net/http"
)

var homepageTpl *template.Template

func init() {
	homepageTpl = GetTemplate("index")
}

// HomeHandler renders the homepage view template
func HomeHandler(w http.ResponseWriter, r *http.Request) {
	setCSS(w)

	fullData := map[string]interface{}{
		"NavigationBar": template.HTML(GetNavigationBarHTML()),
	}
	// x := homepageTpl
	// template := GetTemplate("index")
	Render(w, r, homepageTpl, "index", fullData)
}
