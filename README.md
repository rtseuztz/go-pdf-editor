# ApartmentGenerator
Generates a random apartment.
https://medium.com/meshstudio/serving-up-html-with-go-92f767856daf

// Auto-generated files to bundle templates/style-sheets together
- assets
  - assets.go
  - bindata.go
// Static files, which will be style-sheets for this project
- static
  - navigation_bar.css
  - style.css
  - third_view.css
// HTML templates, which will be rendered and served
- templates
  - index.html
  - navigation_bar.html
  - second_view.html
  - third_view.html
// Bulk of logic goes here
- main.go
// Route-specific logic for the third_view template
- third_view.go