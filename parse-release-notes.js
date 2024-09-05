const { JSDOM } = require('jsdom');
const fs = require('fs');
const path = require('path');
const { Readability } = require('@mozilla/readability');

async function fetchAndParse(url) {
    try {
        const fetch = (await import('node-fetch')).default;
        const proxyUrl = 'https://api.allorigins.win/get?url=';
        const response = await fetch(proxyUrl + encodeURIComponent(url));

        if (!response.ok) {
            throw new Error(`Proxy server returned status ${response.status}`);
        }

        const responseText = await response.text();
        console.log('Response from proxy:', responseText);

        const data = JSON.parse(responseText);
        let htmlContent = data.contents;

        const baseUrl = new URL(url);
        htmlContent = htmlContent.replace(/src="\/([^"]+)"/g, `src="${baseUrl.origin}/$1"`);

        const dom = new JSDOM(htmlContent);
        const reader = new Readability(dom.window.document);
        const article = reader.parse();

        const htmlHeader = `
<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Readability Example</title>
    <link href="https://fonts.googleapis.com/css2?family=Sergoui&display=swap" rel="stylesheet">
    <style>
        body {
            font-family: 'Sergoui', sans-serif;
            font-size: 14px; /* Adjust the font size as needed */
        }
        img {
            max-width: 500px;
            height: auto;
        }
    </style>
</head>
<body>`;

        const htmlFooter = `</body></html>`;

        const fullHtmlContent = htmlHeader + article.content + htmlFooter;

        const outputPath = path.join(__dirname, 'index.html');
        fs.writeFileSync(outputPath, fullHtmlContent, 'utf8');
        console.log('index.html has been overwritten with the article content.');
    } catch (error) {
        console.error('Error fetching the webpage:', error);
    }
}

const url = 'https://support.maxcutsoftware.com/hc/en-us/articles/360016474633-MaxCut-Version-2-Release-History';
fetchAndParse(url);