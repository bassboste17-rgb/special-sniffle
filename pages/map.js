document.addEventListener("DOMContentLoaded", () => {
  const svgObject = document.getElementById("georgia-map")

  if (!svgObject) {
    console.error("Map object not found")
    return
  }

  let isMapInitialized = false
  let retryCount = 0
  const maxRetries = 5

  function initializeMap() {
    if (isMapInitialized) {
      return
    }

    const svgDoc = svgObject.contentDocument

    if (!svgDoc) {
      if (retryCount < maxRetries) {
        retryCount++
        setTimeout(initializeMap, 200)
      }
      return
    }

    const svg = svgDoc.querySelector("svg")

    if (!svg) {
      console.error("SVG element not found in document")
      return
    }

    // Responsive SVG setup (adds viewBox if missing)
    if (!svg.hasAttribute("viewBox")) {
      const bbox = svg.getBBox()
      svg.setAttribute("viewBox", `0 0 ${bbox.width} ${bbox.height}`)
      svg.setAttribute("preserveAspectRatio", "xMidYMid meet")
    }

    // Create label group
    let labelGroup = svgDoc.getElementById("region-labels")
    if (!labelGroup) {
      labelGroup = document.createElementNS("http://www.w3.org/2000/svg", "g")
      labelGroup.setAttribute("id", "region-labels")
      svg.appendChild(labelGroup)
    }

    const paths = svgDoc.querySelectorAll("path")

    const regions = {
      "GE-AB": {
        translationKey: "regionAbkhazia",
        color: "#3a3a3a",
        page: "abkhazia.html",
        labelPos: { x: 120, y: 70 },
      },
      "GE-AJ": {
        translationKey: "regionAdjara",
        color: "#4d4d4d",
        page: "ajara.html",
        labelPos: { x: 220, y: 300 },
      },
      "GE-GU": {
        translationKey: "regionGuria",
        color: "#525252",
        page: "guria.html",
        labelPos: { x: 200, y: 250 },
      },
      "GE-IM": {
        translationKey: "regionImereti",
        color: "#5a5a5a",
        page: "imereti.html",
        labelPos: { x: 300, y: 230 },
      },
      "GE-KA": {
        translationKey: "regionKakheti",
        color: "#474747",
        page: "kakheti.html",
        labelPos: { x: 640, y: 260 },
      },
      "GE-KK": {
        translationKey: "regionKvemoKartli",
        color: "#5f5f5f",
        page: "kvemo-kartli.html",
        labelPos: { x: 490, y: 320 },
      },
      "GE-MM": {
        translationKey: "regionMtskhetaMtianeti",
        color: "#444444",
        page: "mtkheta-mtianeti.html",
        labelPos: { x: 480, y: 200 },
      },
      "GE-RL": {
        translationKey: "regionRachaLechkhumi",
        color: "#575757",
        page: "racha-lechkhumi.html",
        labelPos: { x: 340, y: 150 },
      },
      "GE-SJ": {
        translationKey: "regionSamtskheJavakheti",
        color: "#4a4a4a",
        page: "samtskhe-javakheti.html",
        labelPos: { x: 310, y: 300 },
      },
      "GE-SK": {
        translationKey: "regionShidaKartli",
        color: "#505050",
        page: "shida-kartli.html",
        labelPos: { x: 400, y: 240 },
      },
      "GE-SZ": {
        translationKey: "regionSamegrelo",
        color: "#424242",
        page: "samegrelo-zemo-svaneti.html",
        labelPos: { x: 200, y: 170 },
      },
      "GE-TB": {
        translationKey: "regionTbilisi",
        color: "#666666",
        page: "tbilisi.html",
        labelPos: { x: 520, y: 320 },
      },
    }

    function getRegionName(translationKey) {
      if (window.languageSwitcher) {
        return window.languageSwitcher.translate(translationKey)
      }
      // Fallback to Georgian if translation system is not available
      const fallbackNames = {
        regionAbkhazia: "აფხაზეთი",
        regionAdjara: "აჭარა",
        regionGuria: "გურია",
        regionImereti: "იმერეთი",
        regionKakheti: "კახეთი",
        regionKvemoKartli: "ქვემო ქართლი",
        regionMtskhetaMtianeti: "მცხეთა-მთიანეთი",
        regionRachaLechkhumi: "რაჭა-ლეჩხუმი",
        regionSamtskheJavakheti: "სამცხე-ჯავახეთი",
        regionShidaKartli: "შიდა ქართლი",
        regionSamegrelo: "სამეგრელო",
        regionTbilisi: "თბილისი",
      }
      return fallbackNames[translationKey] || translationKey
    }

    function renderMapRegions() {
      // Clear existing labels
      while (labelGroup.firstChild) {
        labelGroup.removeChild(labelGroup.firstChild)
      }

      for (const path of paths) {
        const id = path.id
        if (!regions[id]) continue

        const { translationKey, color, page, labelPos } = regions[id]
        const name = getRegionName(translationKey)

        path.style.fill = color
        path.style.cursor = "pointer"
        path.setAttribute("title", name)
        path.setAttribute("aria-label", name)
        path.setAttribute("data-translation-key", translationKey)

        const text = document.createElementNS("http://www.w3.org/2000/svg", "text")
        text.classList.add("region-label")
        text.setAttribute("x", labelPos.x)
        text.setAttribute("y", labelPos.y)
        text.setAttribute("visibility", "hidden")
        text.setAttribute("data-translation-key", translationKey)
        text.textContent = name
        labelGroup.appendChild(text)

        // Remove old event listeners by cloning
        const newPath = path.cloneNode(true)
        path.parentNode.replaceChild(newPath, path)

        newPath.addEventListener("mouseenter", () => {
          newPath.style.fill = "#e5383b"
          text.setAttribute("fill", "#fff")
          text.setAttribute("visibility", "visible")
        })

        newPath.addEventListener("mouseleave", () => {
          newPath.style.fill = color
          text.setAttribute("fill", "#ffffff")
          text.setAttribute("visibility", "hidden")
        })

        newPath.addEventListener("click", () => {
          if (page) window.location.href = page
        })
      }
    }

    // Initial render
    renderMapRegions()

    window.addEventListener("languageChanged", () => {
      renderMapRegions()
    })

    // Add label styles inside SVG
    let style = svgDoc.querySelector("style")
    if (!style) {
      style = document.createElementNS("http://www.w3.org/2000/svg", "style")
      style.textContent = `
        .region-label {
          pointer-events: none;
          font-size: 16px;
          font-family: 'BPG Glaho', sans-serif;
          font-weight: bold;
          text-shadow: 2px 2px 3px rgba(0, 0, 0, 0.8);
        }
      `
      svg.appendChild(style)
    }

    isMapInitialized = true
  }

  // Try to initialize immediately if SVG is already loaded
  if (svgObject.contentDocument) {
    initializeMap()
  } else {
    // Wait for SVG to load
    svgObject.addEventListener("load", () => {
      initializeMap()
    })

    // Fallback: try to initialize after a delay
    setTimeout(() => {
      if (!isMapInitialized) {
        initializeMap()
      }
    }, 500)
  }
})
