
// Loaded via <script> tag, create shortcut to access PDF.js exports.
var pdfjsLib = window['pdfjs-dist/build/pdf'];

// The workerSrc property shall be specified.
pdfjsLib.GlobalWorkerOptions.workerSrc = '//mozilla.github.io/pdf.js/build/pdf.worker.js';
const $fileEle = $(".container #file_input")
const $formEle = $(".container form");
$fileEle.on("change", async () => {
    const fileEle = $fileEle[0];
    const file = fileEle.files[0];
    console.log(file);
    if (!fileEle || !fileEle.files) return;
    if (fileEle.files.length === 0) {
      console.log("file is empty")
      return;
    }

    const buff = await file.arrayBuffer()
    //const binaryData = atob(base64);
    var formData = new FormData();
	formData.append('file', file)
	formData.append("b", "C");
    renderPdf(buff);
	//console.log("data is " + data);
     const response = await fetch('/noTextPDF', {
		method: "POST",
		body: formData
	});
	const blob = await response.blob();
    console.log(`resp is ${blob}`)
	renderPdf(await blob.arrayBuffer())
    // $.get({
    //     url: "/noTextPDF",
    //     type: "POST",
    //     data: formData,
    //     processData: false,
    //     contentType: false,
    //     success: function(res) {
    //         //render these pdf bytes
    //         //const noTextBuff = res
    //         console.log(res);
    //     },
    //     error: function(erR) {
    //         console.log("erR");
    //     }
    // })
    


    // const response = await fetch('http://localhost:3001/removeText', {body: formData});
    // console.log("Response is " + response);
    // const res = await response.json();
    // console.log("res is "+ res);
    //pdfReader.renderPdf(res);
})
// $formEle.on("submit", async (data) => {
// 	console.log("data is " + data)
// })
function renderPdf(buff) {
	var pdfDoc = null,
	pageNum = 1,
	pageRendering = false,
	pageNumPending = null,
	scale = 1,
	canvas = document.getElementById('canvas'),
	ctx = canvas.getContext('2d');
	const loadingTask = pdfjsLib.getDocument({data: buff});
	loadingTask.promise.then(function(pdf) {
			// Fetch the first page
		const page = pdf.getPage(pageNum).then( (page) => {

			var viewport = page.getViewport({scale: scale});
			canvas.height = viewport.height;
			canvas.width = viewport.width;

		// Render PDF page into canvas context
		var renderContext = {
			canvasContext: ctx,
			viewport: viewport
		};
		var renderTask = page.render(renderContext);
		// Wait for rendering to finish
		renderTask.promise.then(function() {
			pageRendering = false;
			if (pageNumPending !== null) {
				// New page rendering is pending
				pdfjsLib.renderPage(pageNumPending);
				pageNumPending = null;
			}
		}).then(function() {
			// Returns a promise, on resolving it will return text contents of the page
			return page.getTextContent();
		}).then(function(textContent) {

			// Assign CSS to the textLayer element
			var textLayer = document.querySelector(".textLayer");

			textLayer.style.left = canvas.offsetLeft + 'px';
			textLayer.style.top = canvas.offsetTop + 'px';
			textLayer.style.height = canvas.offsetHeight + 'px';
			textLayer.style.width = canvas.offsetWidth + 'px';

			// Pass the data to the method for rendering of text over the pdf canvas.
			pdfjsLib.renderTextLayer({
				textContent: textContent,
				container: textLayer,
				viewport: viewport,
				textDivs: []
			});
		});
	});
	}, function(reason) {
			console.error(reason);
	})
		//return [];
}

