let errMsgDiv = document.getElementById("errorMsg");

let title = document.getElementById("title");
let author = document.getElementById("author");

try {
    let urlParams = new URLSearchParams(window.location.hash);
    var paramKey = urlParams.keys().next().value;
    var xmlurl = null;
    if (paramKey.includes("x")) {
        xmlurl = urlParams.values().next().value;
        if (! paramKey.includes("r"))
            xmlurl = atob(xmlurl);
        if (! paramKey.includes("f"))
            xmlurl = "https://raw.githubusercontent.com/"+xmlurl;
    }
} catch {
    errMsgDiv.innerText = "An error occured while trying to get or decode xml file location from the URL: \n\n" 
        + window.location.href;
    xmlurl = null;
    
}

let button = document.getElementById("infoButt");
var innerInfoHTML = null;

if (xmlurl != null)
    fetch(xmlurl)
        .then(function(response) {
            if (response.ok) {
                return response.text();
            }else {
                response.text().then(err => { 
                    errMsgDiv.innerText = "An error occured while trying to fetch image info: \n\n" 
                        + err + "\n\nUrl: " + xmlurl;
                })
                return null;
            }
        })
        .then((text) => {
            if (text == null)
                return
            var doc = null;
            try {
                const parser = new DOMParser();
                doc = parser.parseFromString(text, "text/xml");
            } catch (err) {
                errMsgDiv.innerText = "An error occured while trying to parse info xml: \n\n" 
                    + err.name + ":" + err.message + "\nOpen console for more details.";
                
                console.log("XML file URL: "+xmlurl);
                console.log("XML file contents:");
                console.log(text);
                return
            }
            var panURL = null;
            try {
                panURL = doc.getElementsByTagName("PanoramaURL")[0].getAttribute("url")
            } catch(err) {
                errMsgDiv.innerText = "An error occured while trying to get image url from xml: \n\n" 
                    + err.name + ":" + err.message;
            }
            try {
                pannellum.viewer('panorama', {
                    "type": "equirectangular",
                    "panorama": panURL,
                    "autoLoad": true,
                });
            } catch(err) {
                errMsgDiv.innerText = "An error occured while trying to display image: \n\n" 
                    + err.name + ":" + err.message + "\n\n"
                    +"Image URL that was provided: "+panURL;
            }
            if (doc.getElementsByTagName("InfoPageHTML").length > 0) {
                innerInfoHTML = doc.getElementsByTagName("InfoPageHTML")[0].innerHTML;
                button.style.visibility = "visible";
            }else 
                console.log("No image info HTML was provided :/");
            if (doc.getElementsByTagName("Title").length > 0)
                title.innerText = doc.getElementsByTagName("Title")[0].textContent;
            else
                console.log("No image title was provided :/");
            if (doc.getElementsByTagName("Author").length > 0)
                author.innerText = "by " + doc.getElementsByTagName("Author")[0].textContent;
            else
                console.log("No image author was provided :/");
                
        });

let infodiv = document.getElementById("info");
let infoContent = document.getElementById("infoContent");
button.addEventListener("click", () => {
    infodiv.style.visibility = "visible";
    infoContent.innerHTML = innerInfoHTML;
});

let backButton = document.getElementById("backsvg");
backButton.addEventListener("click", () => {
    infodiv.style.visibility = "hidden";
    infoContent.innerHTML = "";
});