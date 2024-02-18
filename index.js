const puppeteer = require('puppeteer');
const Downloader = require("nodejs-file-downloader");
const os = require('os');
const path = require('path');
const fetchedFiles = [];

(async () => {
    console.log("-----------------------------")
    console.log("     Lookeeloo Downloader    ")
    console.log(" (c) 2023 Qrodex Innovations ")
    console.log("-----------------------------")

    const browser = await puppeteer.launch({ headless: 'new' });
    const page = await browser.newPage();
    await page.setRequestInterception(true);
    page.on('request', (interceptedRequest) => {
        const url = interceptedRequest.url();
        fetchedFiles.push(url);
        interceptedRequest.continue();
    });

    async function downloadFile(URL) {
        var homeDir = os.homedir();
        var videosFolderPath = path.join(homeDir, 'Videos');
        videosFolderPath = path.join(videosFolderPath, 'Lookeeloo Downloader');

        const downloader = new Downloader({
            url: URL,
            directory: videosFolderPath,
            onProgress: function (percentage, chunks, remainingSize) {
                process.stdout.write(parseInt(percentage) + "% Downloaded, " + parseInt(remainingSize) + " Bytes remaining.                                                     \r");
            },
        });

        try {
            await downloader.download();
            console.log('\nVideo saved to: "' + videosFolderPath + '"')
        } catch (error) {
            console.log("\nDownload failed: ", error);
        }
    }

    async function getMP4URL() {
        setTimeout(async () => {
            const pageTitle = await page.title();
            const videoURL = fetchedFiles.find(
                (element) => element.includes('.mp4') || element.includes('.webm')
            )

            console.log('Title:', pageTitle);
            console.log("Video URL: " + videoURL)
            console.log('\nPreparing to download...\n')
            await browser.close();

            setTimeout(async () => {
                await downloadFile(videoURL)

                var stdintoo = process.openStdin();
                process.stdout.write('\nPress any key to exit...');
                stdintoo.on('data', function () {
                    process.exit()
                });
            }, 2500);
        }, 5000);
    }

    var stdin = process.openStdin();
    process.stdout.write('Video ID: ');
    stdin.on('data', async function (line) {
        await page.goto('https://lookeeloo-canary.web.app/player/' + line.toString());
        getMP4URL()
    });
})();