const md = new Remarkable({
	html: true
});

let cache = []
let currentPage = detectPageFromURL()

let xhr = new XMLHttpRequest();
xhr.open("GET", currentPage);
console.log(currentPage)
xhr.onload = function()
{
  let text = xhr.responseText;
  // console.log(text);
  if (text.includes("<!doctype html>") && text.includes(`<script src="https://kit.fontawesome.com/c0fe0ca982.js" crossorigin="anonymous"></script>`)) {
  	text = '# 404'
  }
  document.querySelector("main").innerHTML = md.render(text);
  hljs.highlightAll()
  twemoji.parse(document.body, {folder: 'svg', ext: '.svg'})

  getPageData()
}
xhr.send();

function setContent(name) {
	window.history.pushState(name, `Dot32`, '/'+name);
	currentPage = detectPageFromURL()

	// let cached = false
	// for (let i = 0; i < cache.length; i++) {
 //  	if (cache[i].name === currentPage) {
 //  		document.querySelector("main").replaceWith(cache[i].content)
 //  		console.log(cache[i].content)
 //  		contentsList()
 //  		cached = true
 //  		break
 //  	}
	// }
	// if (!cached) {
		xhr.open("GET", "/" + name + ".md");
		xhr.send();
	// }
}

window.onpopstate = function(event) {
	// console.log(currentPage)
	// xhr.open("GET", currentPage);
	// xhr.send();
	xhr.open("GET", "/" + event.state + ".md");
	xhr.send();
	currentPage = detectPageFromURL()
}

function detectPageFromURL() {
	let page = window.location.pathname.replace('index.html','').replace('.html','')
	if (page.charAt(page.length-1) === "/") {
		console.log("removing slash to " + page)
		page.slice(0, -1);
	}
	page = page + ".md"
	if (page === "/.md") {
		page = "dot32.md"
	}
	page = page.replace('/.md','.md')

	// let title = page.replace('.md', '')
	// title = title.substring(1)
	// title = "Dot32 | " + title
	// document.title = title

	console.log(page)
	return page
}

function getPageData() {
	try {
	  var data = JSON.parse(document.getElementById("json").innerHTML)
	}
	catch(err) {
	  var data = JSON.parse("{}")
	  console.log(err)
	}
	
	console.log(data)

	if (data.archived) {
		document.getElementById("alert").style.display = "block"
		document.getElementById("alert").innerHTML = "<h3>This page is archived, and may be out of date/hard to understand</h3>"
	} else {
		document.getElementById("alert").style.display = "none"
	}

	if (data.author && data.date) {
		document.getElementById("datetime").style.display = "block"
		document.getElementById("datetime").innerHTML = `Written ${data.date} by ${data.author}`
	} else if (data.author) {
		document.getElementById("datetime").style.display = "block"
		document.getElementById("datetime").innerHTML = `Written by ${data.author}`
	} else if (data.date) {
		document.getElementById("datetime").style.display = "block"
		document.getElementById("datetime").innerHTML = `Written ${data.date}`
	} else {
		document.getElementById("datetime").style.display = "none"
	}

	if (data.title) {
		document.title = data.title
		let cardTitle = `${data.title} - Dot32 dev`.replace('Dot32 dev - ', '')
		document.querySelector('meta[property="og:title"]').setAttribute("content", cardTitle);
		console.log(cardTitle)
	} else {
		document.title = `Dot32 | ${currentPage.replace('.md', '').replace('/', '')}`
	}

	if (data.description) {
		document.querySelector('meta[name="description"]').setAttribute("content", data.description);
		document.querySelector('meta[property="og:description"]').setAttribute("content", data.description);
		console.log(data.description)
	}

	if (data.image) {
		document.querySelector('meta[property="og:image"]').setAttribute("content", `https://dot32.netlify.app${data.image}`);
		console.log(`https://dot32.netlify.app${data.image}`)
	}

	contentsList()

	if (window.location.hash) {
		console.log(window.location.hash)
		let elem = document.querySelector(window.location.hash)
		elem.parentElement.className = "flash"
		let fn = function() {
			elem.parentElement.className = ""
			elem.scrollIntoView({behavior: 'smooth'});
		}
		window.setTimeout(fn, 200)
	} else {
		window.scrollTo(0, 0)
	}
}

function contentsList() {
	let list = document.getElementById("contents-ul")
	list.innerHTML = ""

	let page = document.createElement("main")
	let element = document.querySelector("main").firstChild
	let section = document.createElement("section")
	while (element) {
		console.log(element.tagName)
		if (element.tagName == "H1" || element.tagName == "H2" ) {
			if (section.firstChild) {
				page.appendChild(section)
				section = document.createElement("section")
			}

			let li = document.createElement("li")
			let a = document.createElement("a")
			let id = element.innerHTML.replaceAll(' ', '-')
	  	a.innerHTML = element.innerHTML
	  	a.href = "#"+id
	  	// a.setAttribute('onclick',`document.getElementById(${id}).scrollIntoView({behavior: 'smooth'}); return false`)
	  	a.onclick = function(){
	  		document.getElementById(id).scrollIntoView({behavior: 'smooth'});
	  		document.getElementById(id).parentElement.className = "flash"
	  		let fn = function() {
	  			document.getElementById(id).parentElement.className = ""
	  		}
	  		window.setTimeout(fn, 32)
	  		let page = currentPage
	  		window.history.pushState(page.replace(".md", ""), `Dot32`, "#"+id); 
	  		return false
	  	}
	  	li.appendChild(a)
	  	list.appendChild(li)
	  	// console.log(element.innerHTML)

	  	element.id = id
	  	// console.log(id)
		}
		let nextElement = element.nextElementSibling
		section.appendChild(element)
		element = nextElement
	}
	page.appendChild(section)

	if (document.querySelectorAll("#contents-ul li").length < 2) {
		document.querySelector(".contents").style.display = "none"
	} else {
		document.querySelector(".contents").style.display = "block"
	}
	document.querySelector("main").replaceWith(page)

	// let pageData = {name:currentPage, content:document.querySelector("main")}
	// console.log(pageData.content)
	// let cached = false
	// for (let i = 0; i < cache.length; i++) {
 //  	if (cache[i].name === pageData.name) {
 //  		cached = true
 //  	}
	// }
	// if (!cached) {
	// 	cache.push(pageData)
	// 	console.log("added new page to cache")
	// }

	// console.log(cache)
}