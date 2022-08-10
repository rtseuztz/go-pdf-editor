// Loaded via <script> tag, create shortcut to access PDF.js exports.
const pdfjsLib = window['pdfjs-dist/build/pdf'];
const pdfLib = window['PDFLib']
var textObj = [];
var stylesObj = {};
var emptyPDFBytes = [];
// The workerSrc property shall be specified.
pdfjsLib.GlobalWorkerOptions.workerSrc = '//mozilla.github.io/pdf.js/build/pdf.worker.js';
const $container = $(".container")
const $fileEle = $container.find("#file_input")
const $textEle = $container.find(".textLayer");
const $pdfLayer = $container.find("#pdf_layer");
$fileEle.on("change", async () => {
	resetCanvas();
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
    await renderPdf(buff, true);
	//console.log("data is " + data);
     const response = await fetch('/noTextPDF', {
		method: "POST",
		body: formData
	});
	const blob = await response.blob();
    console.log(`resp is ${blob}`)
	emptyPDFBytes = await blob.arrayBuffer()
	await renderPdf(emptyPDFBytes)

})

async function renderPdf(buff, showText) {
	var pdfDoc = null,
	pageNum = 1,
	pageRendering = false,
	pageNumPending = null,
	scale = 1,
	canvas = document.getElementById('canvas'),
	ctx = canvas.getContext('2d');
	ctx.clearRect(0, 0, canvas.width, canvas.height);
	if (showText) {
		$pdfLayer.addClass("hidden");
	}
	const loadingTask = pdfjsLib.getDocument({data: buff});
	const pdf = await loadingTask.promise;
			// Fetch the first page
	const page = await pdf.getPage(pageNum)

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
	await renderTask.promise
	pageRendering = false;
	if (pageNumPending !== null) {
		// New page rendering is pending
		pdfjsLib.renderPage(pageNumPending);
		pageNumPending = null;
	}
	// Returns a promise, on resolving it will return text contents of the page
	const textContent = await page.getTextContent();

	// Assign CSS to the textLayer element
	var textLayer = $textEle[0]
	if (showText) {
		textObj = textContent.items;
		stylesObj = textContent.styles;
	}
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
	}, function(reason) {
			console.error(reason);
	})
	if (!showText) {
		$pdfLayer.removeClass("hidden");
	}
}

const $downloadBtn = $('.container #download_btn');
$downloadBtn.on("click", async () => {
	const bytes = await downloadPdf(emptyPDFBytes);
	saveByteArray("newpdf", bytes);
})
function base64ToArrayBuffer(base64) {
    var binaryString = window.atob(base64);
    var binaryLen = binaryString.length;
    var bytes = new Uint8Array(binaryLen);
    for (var i = 0; i < binaryLen; i++) {
       var ascii = binaryString.charCodeAt(i);
       bytes[i] = ascii;
    }
    return bytes;
 }
 function saveByteArray(reportName, byte) {
    var blob = new Blob([byte], {type: "application/pdf"});
    var link = document.createElement('a');
    link.href = window.URL.createObjectURL(blob);
    var fileName = reportName;
    link.download = fileName;
    link.click();
};
/**
 * 
 * @param {ArrayBuffer} buff 
 * @returns Array of pdf bytes
 */
async function downloadPdf(buff) {

	const pdfDoc = await pdfLib.PDFDocument.load(buff)
	const firstPage = pdfDoc.getPages()[0];
	const {width, height} = firstPage.getSize();
	const helveticaFont = await pdfDoc.embedFont(pdfLib.StandardFonts.Helvetica)
	_.each(textObj, textEle => {
		firstPage.drawText(textEle.str, {
			x: textEle.transform[4],
			y: textEle.transform[5],
			size: textEle.transform[0],
			font: helveticaFont,
			color: pdfLib.rgb(0, 0, 0),
		})
	})
	const newBytes = await pdfDoc.save();
	return newBytes;
		// const loadingTask = pdfjsLib.getDocument({data: buff});
	// loadingTask.promise.then(function(pdf) {
	// 	const page = pdf.getPage(0).then( (page) => {
	// 		_.each(textObj, textEle => {
	// 			firstPage.drawText(textEle.str, {
	// 				x: textEle.transform[4],
	// 				y: textEle.transform[5],
	// 				size: textEle.transform[0],
	// 				font: 12,
	// 				color: rgb(0, 0, 0),
		
	// 			})
	// 		})
	// 	})
	// })
}
function resetCanvas() {
	$textEle.html("");
}