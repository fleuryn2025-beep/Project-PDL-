import { useCallback, useEffect, useState } from "react";
import logoPrimaDewata from "./assets/logo.png";
import "./App.css";

/* =========================================================
   DATABASE IMAGE HELPERS
========================================================= */

const FALLBACK_IMAGE = `data:image/svg+xml;charset=UTF-8,${encodeURIComponent(`
  <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 1200 675">
    <defs>
      <linearGradient id="bg" x1="0" x2="1" y1="0" y2="1">
        <stop offset="0%" stop-color="#0d1322"/>
        <stop offset="50%" stop-color="#111d35"/>
        <stop offset="100%" stop-color="#090d16"/>
      </linearGradient>
    </defs>
    <rect width="1200" height="675" fill="url(#bg)"/>
    <rect x="40" y="40" width="1120" height="595" rx="24" fill="rgba(14,19,28,0.7)" stroke="rgba(142,170,255,0.28)"/>
    <text x="600" y="330" text-anchor="middle" fill="#eaf1ff" font-size="52" font-family="Arial, sans-serif" font-weight="700" letter-spacing="8">NO IMAGE</text>
    <text x="600" y="390" text-anchor="middle" fill="#9bb0d8" font-size="26" font-family="Arial, sans-serif" letter-spacing="4">UPLOAD EVIDENCE</text>
  </svg>
`)}`;

const buildImageUrl = (value) => {
  if (!value || typeof value !== "string") {
    return FALLBACK_IMAGE;
  }

  const trimmed = value.trim();

  if (!trimmed) {
    return FALLBACK_IMAGE;
  }

  if (
    trimmed.startsWith("http://") ||
    trimmed.startsWith("https://") ||
    trimmed.startsWith("data:")
  ) {
    return trimmed;
  }

  return `http://localhost/portfolio-api/uploads/${trimmed.replace(/^\/+/, "")}`;
};

const getSafeImageUrl = (value) => buildImageUrl(value);

const handleImageFallback = (event) => {
  if (event.currentTarget.dataset.fallbackApplied === "true") {
    return;
  }

  event.currentTarget.dataset.fallbackApplied = "true";
  event.currentTarget.src = FALLBACK_IMAGE;
};

const parseCsvRows = (text) => {
  const rows = [];
  let row = [];
  let value = "";
  let inQuotes = false;

  for (let i = 0; i < text.length; i += 1) {
    const char = text[i];
    const next = text[i + 1];

    if (char === '"') {
      if (inQuotes && next === '"') {
        value += '"';
        i += 1;
      } else {
        inQuotes = !inQuotes;
      }
      continue;
    }

    if (char === "," && !inQuotes) {
      row.push(value);
      value = "";
      continue;
    }

    if ((char === "\n" || char === "\r") && !inQuotes) {
      if (char === "\r" && next === "\n") {
        i += 1;
      }
      if (row.length > 0 || value.length > 0) {
        row.push(value);
        rows.push(row);
        row = [];
        value = "";
      }
      continue;
    }

    value += char;
  }

  if (row.length > 0 || value.length > 0) {
    row.push(value);
    rows.push(row);
  }

  return rows.filter((line) =>
    line.some((cell) => String(cell).trim() !== ""),
  );
};

const normalizeProjectName = (value) =>
  String(value ?? "")
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLowerCase()
    .replace(/[^a-z0-9]/g, "");

const PROGRESS_DATA_PROJECT = "PT Wico Interna";

/* =========================================================
   NAVIGATION
========================================================= */

const navigation = [
  {
    id: "home",
    label: "Home",
  },

  {
    id: "experience",
    label: "List Project",
  },

  {
    id: "awards",
    label: "Report PR",
  },

  {
    id: "certifications",
    label: "Report Progres",
  },

  {
    id: "contact",
    label: "Report BAST",
  },
];

const getRouteFromLocation = () => {
  const [route = "home", query = ""] = window.location.hash
    .slice(1)
    .split("?");
  const pageByRoute = {
    home: "home",
    about: "about",
    experience: "experience",
    "report-pr": "awards",
    "report-progress": "certifications",
    certifications: "certifications",
    "report-bast": "contact",
  };

  return {
    page: pageByRoute[route] || "home",
    projectTitle: new URLSearchParams(query).get("project") || "",
  };
};

/* =========================================================
   APP
========================================================= */

function App() {
  const [activePage, setActivePage] = useState(
    () => getRouteFromLocation().page,
  );
  const [selectedProjectTitle, setSelectedProjectTitle] = useState(
    () => getRouteFromLocation().projectTitle,
  );

  const [, setAwards] = useState([]);
  const [, setLeadership] = useState(null);

  const [selectedAward, setSelectedAward] = useState(null);
  /* =======================================================
     LOAD AWARDS & LEADERSHIP FROM DATABASE
  ======================================================= */

  useEffect(() => {
    fetch("http://localhost/portfolio-api/get_awards.php")
      .then((response) => {
        if (!response.ok) {
          throw new Error("Failed to fetch awards");
        }

        return response.json();
      })
      .then((data) => {
        const rawAwards = Array.isArray(data) ? data : data.awards || [];
        const rawLeadership = data && data.leadership ? data.leadership : null;

        const formattedAwards = rawAwards.map((award) => ({
          ...award,
          image: buildImageUrl(award.image),
        }));

        const formattedLeadership = rawLeadership
          ? {
              ...rawLeadership,
              certificates: Array.isArray(rawLeadership.certificates)
                ? rawLeadership.certificates.map((certificate) => ({
                    ...certificate,
                    image: buildImageUrl(certificate.image),
                  }))
                : [],
            }
          : null;

        setAwards(formattedAwards);
        setLeadership(formattedLeadership);

        if (formattedAwards.length > 0) {
          setSelectedAward(formattedAwards[0]);
        } else {
          setSelectedAward(null);
        }
      })
      .catch((error) => {
        console.error("Error loading awards:", error);
      });
  }, []);

  /* =======================================================
     LIGHTBOX
  ======================================================= */

  const [isImageOpen, setIsImageOpen] = useState(false);

  const [lightboxImage, setLightboxImage] = useState(null);

  const [lightboxTitle, setLightboxTitle] = useState("");

  const [imageZoom, setImageZoom] = useState(1);

  const [imagePosition, setImagePosition] = useState({
    x: 0,
    y: 0,
  });

  const [isDragging, setIsDragging] = useState(false);

  const [dragStart, setDragStart] = useState({
    x: 0,
    y: 0,
  });

  /* =======================================================
     CHANGE PAGE
  ======================================================= */

  const changePage = (page, projectTitle = "") => {
    setActivePage(page);
    setSelectedProjectTitle(projectTitle);

    const routeByPage = {
      awards: "report-pr",
      certifications: "report-progress",
      contact: "report-bast",
    };
    const route = routeByPage[page] || page;
    const query = projectTitle
      ? `?project=${encodeURIComponent(projectTitle)}`
      : "";

    window.history.pushState(null, "", `#${route}${query}`);

    window.scrollTo({
      top: 0,
      behavior: "smooth",
    });
  };

  const openProjectReport = (page, projectTitle) => {
    changePage(page, projectTitle);
  };

  useEffect(() => {
    const syncPageWithLocation = () => {
      const route = getRouteFromLocation();
      setActivePage(route.page);
      setSelectedProjectTitle(route.projectTitle);
    };

    window.addEventListener("popstate", syncPageWithLocation);
    window.addEventListener("hashchange", syncPageWithLocation);

    return () => {
      window.removeEventListener("popstate", syncPageWithLocation);
      window.removeEventListener("hashchange", syncPageWithLocation);
    };
  }, []);

  /* =======================================================
     RESET IMAGE
  ======================================================= */

  const resetImage = useCallback(() => {
    setImageZoom(1);

    setImagePosition({
      x: 0,
      y: 0,
    });
  }, []);

  /* =======================================================
     OPEN IMAGE
  ======================================================= */

  const openImage = (image, title) => {
    const safeImage = getSafeImageUrl(image);

    setLightboxImage(safeImage);
    setLightboxTitle(title);

    resetImage();

    setIsImageOpen(true);
  };

  /* =======================================================
     OPEN AWARD IMAGE
  ======================================================= */

  const openAwardImage = () => {
    if (!selectedAward) {
      return;
    }

    openImage(selectedAward.image, selectedAward.title);
  };

  /* =======================================================
     OPEN CERTIFICATE
  ======================================================= */

  const openLeadershipCertificate = (certificate) => {
    openImage(certificate.image, `${certificate.title} — ${certificate.role}`);
  };

  /* =======================================================
     CLOSE IMAGE
  ======================================================= */

  const closeImage = useCallback(() => {
    setIsImageOpen(false);

    setLightboxImage(null);

    setLightboxTitle("");

    resetImage();
  }, [resetImage]);

  /* =======================================================
     CHANGE AWARD
  ======================================================= */

  const handleAwardChange = (award) => {
    setSelectedAward(award);

    closeImage();
  };

  /* =======================================================
     ZOOM IN
  ======================================================= */

  const zoomIn = () => {
    setImageZoom((currentZoom) => Math.min(4, currentZoom + 0.25));
  };

  /* =======================================================
     ZOOM OUT
  ======================================================= */

  const zoomOut = () => {
    setImageZoom((currentZoom) => {
      const newZoom = Math.max(0.5, currentZoom - 0.25);

      if (newZoom <= 1) {
        setImagePosition({
          x: 0,
          y: 0,
        });
      }

      return newZoom;
    });
  };

  /* =======================================================
     WHEEL ZOOM
  ======================================================= */

  const handleWheelZoom = (event) => {
    event.preventDefault();

    if (event.deltaY < 0) {
      setImageZoom((currentZoom) => Math.min(4, currentZoom + 0.15));

      return;
    }

    setImageZoom((currentZoom) => {
      const newZoom = Math.max(0.5, currentZoom - 0.15);

      if (newZoom <= 1) {
        setImagePosition({
          x: 0,
          y: 0,
        });
      }

      return newZoom;
    });
  };

  /* =======================================================
     START DRAG
  ======================================================= */

  const handleMouseDown = (event) => {
    if (imageZoom <= 1) {
      return;
    }

    event.preventDefault();

    setIsDragging(true);

    setDragStart({
      x: event.clientX - imagePosition.x,

      y: event.clientY - imagePosition.y,
    });
  };

  /* =======================================================
     DRAG IMAGE
  ======================================================= */

  const handleMouseMove = (event) => {
    if (!isDragging) {
      return;
    }

    setImagePosition({
      x: event.clientX - dragStart.x,

      y: event.clientY - dragStart.y,
    });
  };

  /* =======================================================
     STOP DRAG
  ======================================================= */

  const handleMouseUp = () => {
    setIsDragging(false);
  };

  /* =======================================================
     ESCAPE KEY
  ======================================================= */

  useEffect(() => {
    const handleEscape = (event) => {
      if (event.key === "Escape") {
        closeImage();
      }
    };

    document.addEventListener("keydown", handleEscape);

    return () => {
      document.removeEventListener("keydown", handleEscape);
    };
  }, [closeImage]);

  /* =======================================================
     LOCK BODY SCROLL
  ======================================================= */

  useEffect(() => {
    if (isImageOpen) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "";
    }

    return () => {
      document.body.style.overflow = "";
    };
  }, [isImageOpen]);

  /* =======================================================
     PAGE CONTENT
  ======================================================= */

  const renderPage = () => {
    switch (activePage) {
      /* ===================================================
         HOME
      =================================================== */

      case "home":
        return <HomePage onNavigate={changePage} />;

      /* ===================================================
         ABOUT
      =================================================== */

      case "about":
        return <AboutPage onNavigate={changePage} />;

      /* ===================================================
         EXPERIENCE
      =================================================== */

      case "experience":
        return <ExperiencePage onOpenReport={openProjectReport} />;

      /* ===================================================
         PROJECT REPORT PAGES
      =================================================== */

      case "awards":
        return (
          <ProjectReportPage
            type="PR"
            projectTitle={selectedProjectTitle}
            onNavigate={changePage}
          />
        );

      case "certifications":
        return (
          <ProjectProgressPage
            key={selectedProjectTitle}
            projectTitle={selectedProjectTitle}
            onNavigate={changePage}
          />
        );

      case "contact":
        return (
          <ProjectBastPage
            projectTitle={selectedProjectTitle}
            onNavigate={changePage}
          />
        );

      default:
        return <HomePage onNavigate={changePage} />;
    }
  };

  /* =======================================================
     RENDER
  ======================================================= */

  return (
    <div className="portfolio">
      {/* =================================================
          NAVBAR
      ================================================= */}
      <header className="navbar">
        <div className="nav-container">
          <nav className="nav-menu" aria-label="Primary navigation">
            {navigation.map((item) => (
              <button
                key={item.id}
                type="button"
                className={activePage === item.id ? "active" : ""}
                onClick={() => changePage(item.id)}
              >
                {item.label}
              </button>
            ))}
          </nav>
        </div>
      </header>

      {/* =================================================
          PAGE
      ================================================= */}

      <main className="page-content">{renderPage()}</main>

      {/* =================================================
          IMAGE LIGHTBOX
      ================================================= */}

      {isImageOpen && lightboxImage && (
        <div className="image-lightbox" onClick={closeImage}>
          <button
            type="button"
            className="lightbox-close"
            onClick={(event) => {
              event.stopPropagation();
              closeImage();
            }}
            aria-label="Close image"
          >
            ×
          </button>

          <div
            className="lightbox-content"
            onClick={(event) => event.stopPropagation()}
          >
            <div className="zoom-controls">
              <button type="button" onClick={zoomOut}>
                −
              </button>

              <span>{Math.round(imageZoom * 100)}%</span>

              <button type="button" onClick={zoomIn}>
                +
              </button>

              <button type="button" onClick={resetImage}>
                RESET
              </button>
            </div>

            <div
              className="lightbox-image-wrapper"
              onWheel={handleWheelZoom}
              onMouseDown={handleMouseDown}
              onMouseMove={handleMouseMove}
              onMouseUp={handleMouseUp}
              onMouseLeave={handleMouseUp}
            >
              <img
                src={getSafeImageUrl(lightboxImage)}
                alt={lightboxTitle}
                draggable="false"
                onError={handleImageFallback}
                style={{
                  transform: `
                      translate(
                        ${imagePosition.x}px,
                        ${imagePosition.y}px
                      )
                      scale(${imageZoom})
                    `,
                  cursor:
                    imageZoom > 1
                      ? isDragging
                        ? "grabbing"
                        : "grab"
                      : "zoom-in",
                }}
              />
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

/* =========================================================
   HOME PAGE
========================================================= */

function HomePage({ onNavigate }) {
  return (
    <section className="home-page">
      <div className="home-container">
        <div className="hero-content">
          <p className="hero-description"> DIVISI PROJECT</p>

          <div className="hero-buttons">
            <button
              type="button"
              className="primary-button"
              onClick={() => onNavigate("experience")}
            >
              List Project
              <span>↗</span>
            </button>

            <button
              type="button"
              className="secondary-button"
              onClick={() => onNavigate("contact")}
            >
              REPORT BAST
            </button>
          </div>

          <div className="hero-stats">
            <div className="stat stat-address">
              <strong>ALAMAT</strong>
              <span>
                Jl. Perumahan Pesona Paramita 2 No.34, Padangsambian Kaja, Kec.
                Denpasar Barat, Kota Denpasar, Bali 80117
              </span>
            </div>
          </div>
        </div>
        <div className="hero-visual">
          <div className="visual-grid"></div>

          <div className="logo">
            <div className="card-top"></div>

            <div className="engineer-symbol">
              <img
                src={logoPrimaDewata}
                alt="Prima Dewata logo"
                className="engineer-logo"
              />
            </div>
          </div>
        </div>{" "}
        {/* Penutup hero-visual */}
      </div>{" "}
      {/* Penutup home-container */}
    </section> /* Penutup home-page */
  );
}

/* =========================================================
   ABOUT PAGE
========================================================= */
function AboutPage({ onNavigate }) {
  return (
    <section className="about-page">
      <div className="section-container">
        <div className="about-grid">
          {/* KOLOM KIRI (Judul & Teks Intro Menyatu) */}
          <div className="about-intro">
            <h2 className="about-heading">
              Electrical Engineering
              <br />
              <span>with a Project Mindset.</span>
            </h2>

            <p className="about-lead"></p>

            <p className="about-text">
              My experience covers electrical systems, instrumentation,
              industrial automation, maintenance, installation, inspection,
              testing, commissioning, and technical project coordination.
            </p>

            <p className="about-text">
              I enjoy working between engineering and field execution —
              translating technical requirements into practical solutions while
              coordinating with project teams, vendors, subcontractors, and site
              personnel.
            </p>
          </div>

          {/* KOLOM KANAN (Kartu Detail) */}
          <div className="about-details">
            <div className="detail-card">
              <span className="detail-label">EDUCATION</span>
              <h3>Bachelor of Electrical Engineering</h3>
              <p>Universitas Muhammadiyah Yogyakarta</p>
              <strong>GPA 3.72 / 4.00</strong>
            </div>

            <div className="detail-card">
              <span className="detail-label">CORE FOCUS</span>
              <div className="focus-list">
                <span>Electrical Engineering</span>
                <span>Instrumentation</span>
                <span>Industrial Automation</span>
                <span>Project Engineering</span>
                <span>Testing & Commissioning</span>
                <span>Technical Coordination</span>
              </div>
            </div>

            <div className="detail-card">
              <span className="detail-label">PROFESSIONAL APPROACH</span>
              <p className="approach-text">
                Analytical, detail-oriented, adaptable, and comfortable working
                independently or within multidisciplinary teams.
              </p>
            </div>
          </div>
        </div>

        {/* FOOTER & TOMBOL NEXT */}
        <div className="about-footer">
          <div>
            <span>BASED IN</span>
            <strong>Yogyakarta, Indonesia</strong>
          </div>

          <div>
            <span>AVAILABILITY</span>
            <strong>Open to Opportunities</strong>
          </div>

          <div>
            <span>ENGINEERING</span>
            <strong>Electrical • Instrumentation • Projects</strong>
          </div>
        </div>

        <button
          type="button"
          className="page-next-button"
          onClick={() => onNavigate("experience")}
        >
          View Experience →
        </button>
      </div>
    </section>
  );
}

/* =========================================================
   EXPERIENCE PAGE
========================================================= */

function ExperiencePage({ onOpenReport }) {
  const GOOGLE_SHEET_CSV_URL =
    "https://docs.google.com/spreadsheets/d/1l7pMIQ7yZ8LmkyOK4HJ5rPIaabGCjUPXisn0E_aJPx0/export?format=csv&gid=2119967716";

  const [projects, setProjects] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [searchTerm, setSearchTerm] = useState("");

  useEffect(() => {
    let isMounted = true;
    let hasLoadedProjects = false;

    const loadProjects = async () => {
      try {
        const response = await fetch(GOOGLE_SHEET_CSV_URL, {
          cache: "no-store",
        });
        if (!response.ok) {
          throw new Error("Gagal mengambil data project.");
        }

        const csvText = await response.text();
        const rows = parseCsvRows(csvText);

        if (rows.length < 2) {
          throw new Error("Sheet tidak memiliki data yang valid.");
        }

        const headers = rows[0].map((header) => header.trim());
        const dataRows = rows.slice(1).map((row) => {
          const item = {};
          headers.forEach((header, index) => {
            item[header] = row[index] ?? "";
          });
          return item;
        });

        const mappedProjects = dataRows
          .filter((row) =>
            Object.values(row).some((value) => String(value).trim()),
          )
          .map((row, index) => ({
            id: `${row[headers[0]] || "project"}-${index}`,
            ...row,
          }));

        if (isMounted) {
          setProjects(mappedProjects);
          setError("");
          setLoading(false);
          hasLoadedProjects = true;
        }
      } catch (fetchError) {
        if (isMounted) {
          if (!hasLoadedProjects) {
            setError(fetchError.message || "Gagal memuat data project.");
          }
          setLoading(false);
        }
      }
    };

    loadProjects();
    const refreshInterval = window.setInterval(loadProjects, 60_000);

    return () => {
      isMounted = false;
      window.clearInterval(refreshInterval);
    };
  }, []);

  const getProjectTitle = (project) => {
    const candidates = [
      project["Nama Client"],
      project["Client Name"],
      project["Client"],
      project["Project Name"],
      project["Nama Project"],
      project["Judul"],
      project["Title"],
      project["Project"],
      project["Name"],
      project["Project Name / Title"],
      project["List Project"],
    ];

    return candidates.find((value) => String(value ?? "").trim()) || "Project";
  };

  const getProjectMeta = (project) => {
    const normalizeKey = (key) => key.toLowerCase().replace(/[^a-z]/g, "");
    const projectEntries = Object.entries(project).filter(
      ([key]) => key !== "id",
    );
    const targetIndex = projectEntries.findIndex(([key]) =>
      ["targetpenyelesaian", "targetcompletion", "targetselesai"].includes(
        normalizeKey(key),
      ),
    );
    const entriesThroughTarget =
      targetIndex === -1
        ? projectEntries
        : projectEntries.slice(0, targetIndex + 1);

    const isIdentifierKey = (key) => {
      const normalized = normalizeKey(key);

      return ["id", "no", "nomor", "number", "index", "serial"].some((token) =>
        normalized.includes(token),
      );
    };

    return entriesThroughTarget
      .filter(([key]) => {
        const normalized = key.toLowerCase().trim();

        if (
          [
            "nama client",
            "client name",
            "client",
            "project name",
            "nama project",
            "judul",
            "title",
            "project",
            "name",
            "project name / title",
            "list project",
          ].includes(normalized)
        ) {
          return false;
        }

        if (isIdentifierKey(key)) {
          return false;
        }

        return true;
      })
      .map(([key, value]) => ({
        label: key,
        value: value,
      }));
  };

  const normalizedSearch = searchTerm.trim().toLowerCase();
  const filteredProjects = projects.filter((project) => {
    if (!normalizedSearch) {
      return true;
    }

    return [getProjectTitle(project), ...Object.values(project)].some((value) =>
      String(value ?? "")
        .toLowerCase()
        .includes(normalizedSearch),
    );
  });

  return (
    <section className="experience-page">
      <div className="section-container">
        <div className="section-heading project-heading">
          <h2>Project</h2>
        </div>

        {!loading && !error && projects.length > 0 && (
          <div className="project-search">
            <label htmlFor="project-search-input">CARI PROJECT</label>
            <input
              id="project-search-input"
              type="search"
              value={searchTerm}
              onChange={(event) => setSearchTerm(event.target.value)}
              placeholder="Cari nama, lokasi, status, atau detail project..."
            />
            <span className="project-search-count" aria-live="polite">
              Menampilkan {filteredProjects.length} dari {projects.length} project
            </span>
          </div>
        )}

        {loading && (
          <div className="experience-timeline">
            <article className="experience-item">
              <div className="experience-content">
                <p className="experience-description">Memuat data project...</p>
              </div>
            </article>
          </div>
        )}

        {!loading && error && (
          <div className="experience-timeline">
            <article className="experience-item">
              <div className="experience-content">
                <p className="experience-description">{error}</p>
              </div>
            </article>
          </div>
        )}

        {!loading && !error && (
          <div className="experience-timeline">
            {filteredProjects.length === 0 ? (
              <p className="project-search-empty">
                Project dengan kata kunci “{searchTerm}” tidak ditemukan.
              </p>
            ) : (
              filteredProjects.map((project, index) => {
                const title = getProjectTitle(project);
                const meta = getProjectMeta(project);
                const projectDate = String(
                  project["Tanggal"] || project["Date"] || "",
                ).trim();
                const projectLocation = String(
                  project["Lokasi"] ||
                    project["Location"] ||
                    project["Area"] ||
                    "",
                ).trim();

                return (
                  <article
                    className="experience-item"
                    key={project.id || index}
                  >
                    <div className="experience-marker">
                      {String(index + 1).padStart(2, "0")}
                    </div>

                    <div className="experience-content">
                      {(projectDate || projectLocation) && (
                        <div className="experience-meta">
                          {projectDate && <span>{projectDate}</span>}
                          {projectLocation && <span>{projectLocation}</span>}
                        </div>
                      )}

                      <h3>{title}</h3>

                      <div className="experience-achievement">
                        <span className="achievement-label">
                          DETAIL PROJECT
                        </span>

                        <ul>
                          {meta.map((item) => (
                            <li key={`${title}-${item.label}`}>
                              <strong>{item.label}:</strong> {item.value}
                            </li>
                          ))}
                        </ul>
                      </div>

                      <div className="project-report-actions">
                        {title.toLowerCase().includes("wico") && (
                          <button
                            type="button"
                            className="secondary-button"
                            onClick={() =>
                              onOpenReport("certifications", title)
                            }
                          >
                            Report Progres <span>→</span>
                          </button>
                        )}
                        <button
                          type="button"
                          className="secondary-button"
                          onClick={() => onOpenReport("awards", title)}
                        >
                          Report PR <span>→</span>
                        </button>
                        <button
                          type="button"
                          className="secondary-button"
                          onClick={() => onOpenReport("contact", title)}
                        >
                          Report BAST <span>→</span>
                        </button>
                      </div>
                    </div>
                  </article>
                );
              })
            )}
          </div>
        )}

        <div className="experience-summary">
          <div className="summary-item">
            <strong>{projects.length || 0}</strong>
            <span>Total Project</span>
          </div>

          <div className="summary-item">
            <strong>LIVE</strong>
            <span>From Sheet</span>
          </div>

          <div className="summary-item">
            <strong>CSV</strong>
            <span>Auto Load</span>
          </div>

          <div className="summary-item">
            <strong>DATA</strong>
            <span>Updated</span>
          </div>
        </div>

      </div>
    </section>
  );
}

function ProjectReportPage({ type, projectTitle, onNavigate }) {
  const hasProject = Boolean(projectTitle);

  return (
    <section className="experience-page project-report-page">
      <div className="section-container">
        <div className="project-report-selection">
          <span className="achievement-label">PROJECT TERPILIH</span>
          <h3>{hasProject ? projectTitle : "Belum ada proyek dipilih"}</h3>
          {!hasProject && (
            <p>Pilih proyek terlebih dahulu untuk membuat Report {type}.</p>
          )}
        </div>

        <button
          type="button"
          className="page-next-button"
          onClick={() => onNavigate("experience")}
        >
          Pilih Project →
        </button>
      </div>
    </section>
  );
}

function ProgressChart({ dayLabels, summaryRows }) {
  const chartWidth = 900;
  const chartHeight = 340;
  const chartPadding = { top: 20, right: 24, bottom: 42, left: 58 };
  const plotWidth = chartWidth - chartPadding.left - chartPadding.right;
  const plotHeight = chartHeight - chartPadding.top - chartPadding.bottom;
  const series = [
    {
      label: "Rencana Kumulatif",
      row: summaryRows.find((row) =>
        /^kumulatif rencana/i.test(row[11]?.trim() || ""),
      ),
      color: "#39d98a",
      dashed: true,
    },
    {
      label: "Realisasi Kumulatif",
      row: summaryRows.find((row) =>
        /^kumulatif realisasi/i.test(row[11]?.trim() || ""),
      ),
      color: "#8292ff",
      dashed: false,
    },
  ].map((item) => ({
    ...item,
    values: dayLabels.map((_, index) => {
      const value = item.row?.[13 + index]?.trim();
      if (!value) {
        return null;
      }

      const normalizedValue = value.includes(",")
        ? value.replace(/\./g, "").replace(",", ".").replace("%", "")
        : value.replace("%", "");
      const parsedValue = Number(normalizedValue);

      return Number.isFinite(parsedValue) ? parsedValue : null;
    }),
  }));
  const maximumValue = Math.max(
    100,
    ...series.flatMap((item) => item.values.filter((value) => value !== null)),
  );
  const yMaximum = Math.ceil(maximumValue / 20) * 20;
  const xPosition = (index) =>
    chartPadding.left +
    (dayLabels.length > 1 ? (index / (dayLabels.length - 1)) * plotWidth : 0);
  const yPosition = (value) =>
    chartPadding.top + plotHeight - (value / yMaximum) * plotHeight;
  const hasChartData = series.some((item) =>
    item.values.some((value) => value !== null),
  );

  const getSeriesPath = (values) => {
    let hasStarted = false;

    return values.reduce((path, value, index) => {
      if (value === null) {
        hasStarted = false;
        return path;
      }

      const command = hasStarted ? "L" : "M";
      hasStarted = true;
      return `${path}${command}${xPosition(index)},${yPosition(value)} `;
    }, "");
  };

  return (
    <div className="progress-chart" id="progress-chart">
      <div className="progress-chart-heading">
        <h3>Grafik Progres Kumulatif</h3>
        <div className="progress-chart-legend">
          {series.map((item) => (
            <span key={item.label}>
              <i
                className={item.dashed ? "dashed" : ""}
                style={{ "--chart-series-color": item.color }}
              />
              {item.label}
            </span>
          ))}
        </div>
      </div>

      {hasChartData ? (
        <div className="progress-chart-scroll">
          <svg
            className="progress-chart-svg"
            viewBox={`0 0 ${chartWidth} ${chartHeight}`}
            role="img"
            aria-label="Grafik progres kumulatif rencana dan realisasi"
          >
            {[0, 0.25, 0.5, 0.75, 1].map((fraction) => {
              const value = yMaximum * fraction;
              const y = yPosition(value);

              return (
                <g key={fraction}>
                  <line
                    x1={chartPadding.left}
                    x2={chartWidth - chartPadding.right}
                    y1={y}
                    y2={y}
                    className="progress-chart-gridline"
                  />
                  <text
                    x={chartPadding.left - 10}
                    y={y + 4}
                    textAnchor="end"
                    className="progress-chart-axis-label"
                  >
                    {value}%
                  </text>
                </g>
              );
            })}

            {dayLabels.map((day, index) =>
              index % 5 === 0 || index === dayLabels.length - 1 ? (
                <text
                  key={`${day}-${index}`}
                  x={xPosition(index)}
                  y={chartHeight - 12}
                  textAnchor="middle"
                  className="progress-chart-axis-label"
                >
                  {day}
                </text>
              ) : null,
            )}

            {series.map((item) => (
              <g key={item.label}>
                <path
                  d={getSeriesPath(item.values)}
                  fill="none"
                  stroke={item.color}
                  strokeWidth="3"
                  strokeDasharray={item.dashed ? "8 7" : undefined}
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />
                {item.values.map((value, index) =>
                  value === null ? null : (
                    <circle
                      key={`${item.label}-${index}`}
                      cx={xPosition(index)}
                      cy={yPosition(value)}
                      r="3.5"
                      fill={item.color}
                    />
                  ),
                )}
              </g>
            ))}
          </svg>
        </div>
      ) : (
        <p className="progress-report-message">
          Data grafik progres belum tersedia.
        </p>
      )}
    </div>
  );
}

function ProjectProgressPage({ projectTitle, onNavigate }) {
  const PROGRESS_CSV_URL =
    "https://docs.google.com/spreadsheets/d/1b484ltGg0Gw1PwUriknvyRLckYZTtvtf/export?format=csv&gid=936134645";
  const SPREADSHEET_URL =
    "https://docs.google.com/spreadsheets/d/1b484ltGg0Gw1PwUriknvyRLckYZTtvtf/edit?gid=936134645#gid=936134645";
  const projectOptions = [
    "PT Wico Interna",
    "Villa Kropak Sidemen",
    "Bambootel View Sawah 3M3",
    "Bambootel View Sawah 15M3",
  ];

  const [selectedProjectName, setSelectedProjectName] = useState(
    projectTitle || "",
  );
  const [searchTerm, setSearchTerm] = useState("");
  const [progressSearchTerm, setProgressSearchTerm] = useState("");
  const [progressData, setProgressData] = useState(null);
  const [isChartOpen, setIsChartOpen] = useState(false);
  const [isProgressTableOpen, setIsProgressTableOpen] = useState(true);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const activeProjectName = projectTitle || selectedProjectName;
  const hasProgressData =
    normalizeProjectName(activeProjectName) ===
    normalizeProjectName(PROGRESS_DATA_PROJECT);

  useEffect(() => {
    if (!hasProgressData || progressData) {
      return undefined;
    }

    let isMounted = true;
    setLoading(true);

    const loadProgress = async () => {
      try {
        const response = await fetch(PROGRESS_CSV_URL, {
          cache: "no-store",
        });
        if (!response.ok) {
          throw new Error("Gagal mengambil data spreadsheet progres.");
        }

        const rows = parseCsvRows(await response.text());
        const headerIndex = rows.findIndex(
          (row) =>
            row[1]?.trim().toUpperCase() === "NO" &&
            row[2]?.trim().toUpperCase() === "URAIAN PEKERJAAN",
        );

        if (headerIndex === -1) {
          throw new Error("Format sheet M PRJ DIMA tidak ditemukan.");
        }

        const monthLabel =
          rows[headerIndex].find((cell) => /[A-Z]+\s+\d{4}/i.test(cell)) ||
          "PROGRESS PROJECT";
        const dayLabels = rows[headerIndex + 1]
          .slice(13, 44)
          .filter((day) => day.trim());
        const tableRows = rows.slice(headerIndex + 2);
        const deviationIndex = tableRows.findIndex((row) =>
          /^deviasi$/i.test(row[11]?.trim() || ""),
        );
        const bodyRows = (
          deviationIndex === -1
            ? tableRows
            : tableRows.slice(0, deviationIndex + 1)
        )
          .filter((row) =>
            row.slice(1, 45).some((cell) => String(cell).trim()),
          );

        if (dayLabels.length === 0 || bodyRows.length === 0) {
          throw new Error("Data progres pada sheet M PRJ DIMA kosong.");
        }

        if (isMounted) {
          setProgressData({ monthLabel, dayLabels, bodyRows });
          setError("");
        }
      } catch (loadError) {
        console.error("Error loading M PRJ DIMA progress:", loadError);
        if (isMounted) {
          setError(loadError.message || "Gagal memuat data progres.");
        }
      } finally {
        if (isMounted) {
          setLoading(false);
        }
      }
    };

    loadProgress();

    return () => {
      isMounted = false;
    };
  }, [progressData, hasProgressData]);

  const summaryRows = progressData?.bodyRows.filter((row) =>
    /^(rencana harian|kumulatif rencana|realisasi harian|kumulatif realisasi|deviasi)/i.test(
      row[11]?.trim() || "",
    ),
  ) || [];
  const filteredProgressRows =
    progressData?.bodyRows.filter((row) =>
      row.some((cell) =>
        String(cell).toLowerCase().includes(progressSearchTerm.trim().toLowerCase()),
      ),
    ) || [];

  const getLatestSummaryValue = (label) => {
    const summaryRow = summaryRows.find((row) =>
      row[11]?.trim().toLowerCase().startsWith(label.toLowerCase()),
    );
    const dailyValues = summaryRow?.slice(13, 44).filter((value) => value.trim());

    return dailyValues?.[dailyValues.length - 1] || "—";
  };

  const filteredProjects = projectOptions.filter((project) =>
    project.toLowerCase().includes(searchTerm.trim().toLowerCase()),
  );

  const handleProjectSelect = (projectName) => {
    setSelectedProjectName(projectName);
    setProgressData(null);
    setProgressSearchTerm("");
    setError("");
    onNavigate("certifications", projectName);
  };

  const projectPicker = (
    <div className="progress-project-switcher">
      <label htmlFor="progress-project-search">Filter Project</label>
      <input
        id="progress-project-search"
        type="search"
        value={searchTerm}
        onChange={(event) => setSearchTerm(event.target.value)}
        placeholder="Cari nama project..."
      />
      <p className="bast-project-count" aria-live="polite">
        Menampilkan {filteredProjects.length} dari {projectOptions.length} project
      </p>

      {filteredProjects.length > 0 ? (
        <div className="progress-project-switcher-list">
          {filteredProjects.map((project) => (
            <button
              key={project}
              type="button"
              className={`progress-project-switcher-item ${
                activeProjectName === project ? "active" : ""
              }`}
              onClick={() => handleProjectSelect(project)}
            >
              <span>{project}</span>
              <span aria-hidden="true">→</span>
            </button>
          ))}
        </div>
      ) : (
        <p className="bast-report-message bast-project-empty">
          Project dengan nama “{searchTerm}” tidak ditemukan.
        </p>
      )}
    </div>
  );

  if (!activeProjectName) {
    return (
      <section className="progress-report-page">
        <div className="section-container">
          <div className="bast-report-heading">
            <div>
              <span className="achievement-label">DAFTAR PROJECT</span>
              <h2>Pilih Project</h2>
            </div>
            <a
              className="progress-source-link"
              href={SPREADSHEET_URL}
              target="_blank"
              rel="noreferrer"
            >
              Spreadsheet ↗
            </a>
          </div>

          {projectPicker}
        </div>
      </section>
    );
  }

  return (
    <section className="progress-report-page">
      <div className="section-container">
        <div className="progress-report-toolbar">
          <a
            className="progress-source-link"
            href={SPREADSHEET_URL}
            target="_blank"
            rel="noreferrer"
          >
            Spreadsheet ↗
          </a>
        </div>

        {projectPicker}

        <div className="progress-report-content">
            {loading && (
              <p className="progress-report-message">
                Memuat data progres...
              </p>
            )}

            {!loading && error && (
              <p className="progress-report-message progress-report-error">
                {error}
              </p>
            )}

            {!loading && !error && !progressData && (
              <p className="progress-report-message">
                Data progres untuk project ini belum tersedia. Saat ini data
                progres baru tersedia untuk {PROGRESS_DATA_PROJECT}.
              </p>
            )}

            {!loading && !error && progressData && (
              <>
                <div className="progress-summary">
                  <article>
                    <span>RENCANA KUMULATIF</span>
                    <strong>{getLatestSummaryValue("kumulatif rencana")}</strong>
                  </article>
                  <article>
                    <span>REALISASI KUMULATIF</span>
                    <strong>
                      {getLatestSummaryValue("kumulatif realisasi")}
                    </strong>
                  </article>
                  <article>
                    <span>DEVIASI</span>
                    <strong>{getLatestSummaryValue("deviasi")}</strong>
                  </article>
                </div>

                <div className="progress-table-tools">
                  <button
                    type="button"
                    className="progress-chart-toggle"
                    aria-expanded={isChartOpen}
                    aria-controls="progress-chart"
                    onClick={() => {
                      if (!isProgressTableOpen) {
                        setIsProgressTableOpen(true);
                        setIsChartOpen(true);
                        return;
                      }

                      setIsChartOpen((isOpen) => !isOpen);
                    }}
                  >
                    {isChartOpen ? "Tutup Grafik" : "Buka Grafik"}
                  </button>
                  <button
                    type="button"
                    className="progress-chart-back"
                    onClick={() => {
                      setIsChartOpen(false);
                      setIsProgressTableOpen(false);
                    }}
                    aria-label="Tutup tabel dan grafik"
                  >
                    Tutup
                  </button>
                  <label htmlFor="progress-table-search">Filter item pekerjaan</label>
                  <input
                    id="progress-table-search"
                    type="search"
                    value={progressSearchTerm}
                    onChange={(event) =>
                      setProgressSearchTerm(event.target.value)
                    }
                    placeholder="Cari uraian, satuan, bobot, atau nilai..."
                  />
                  <span aria-live="polite">
                    {filteredProgressRows.length} dari {progressData.bodyRows.length} item
                  </span>
                </div>

                {isProgressTableOpen && (
                  <>
                    {isChartOpen && (
                      <ProgressChart
                        dayLabels={progressData.dayLabels}
                        summaryRows={summaryRows}
                      />
                    )}

                    <div className="progress-sheet-caption">
                      <span>{progressData.monthLabel}</span>
                      <span>M PRJ DIMA</span>
                    </div>

                    <div className="progress-table-scroll">
                      <table className="progress-table">
                    <thead>
                      <tr>
                        <th rowSpan="2">NO</th>
                        <th rowSpan="2">URAIAN PEKERJAAN</th>
                        <th rowSpan="2">SATUAN</th>
                        <th rowSpan="2">VOLUME</th>
                        <th rowSpan="2">BOBOT</th>
                        <th colSpan={progressData.dayLabels.length}>
                          {progressData.monthLabel}
                        </th>
                        <th rowSpan="2">TOTAL</th>
                      </tr>
                      <tr>
                        {progressData.dayLabels.map((day, index) => (
                          <th key={`${day}-${index}`}>{day}</th>
                        ))}
                      </tr>
                    </thead>
                    <tbody>
                      {filteredProgressRows.map((row, rowIndex) => {
                        const isSummary = /^(rencana harian|kumulatif rencana|realisasi harian|kumulatif realisasi|deviasi)/i.test(
                          row[11]?.trim() || "",
                        );
                        const isSection =
                          Boolean(row[1]?.trim()) &&
                          !row[10]?.trim() &&
                          !row[11]?.trim() &&
                          !row[12]?.trim() &&
                          Boolean(row[9]?.trim());
                        const description = isSummary
                          ? row[11].trim()
                          : row
                              .slice(2, isSection ? 9 : 10)
                              .map((cell) => cell.trim())
                              .filter(Boolean)
                              .join(" ");
                        const isTotal =
                          !row[1]?.trim() &&
                          !description &&
                          row[12]?.trim() === "100,00%";
                        const dailyCells = progressData.dayLabels.map(
                          (_, dayIndex) => row[13 + dayIndex] || "",
                        );

                        return (
                          <tr
                            key={`progress-${rowIndex}`}
                            className={[
                              isSection ? "progress-section-row" : "",
                              isSummary ? "progress-summary-row" : "",
                              isTotal ? "progress-total-row" : "",
                            ]
                              .filter(Boolean)
                              .join(" ")}
                          >
                            <td>{row[1]?.trim() || ""}</td>
                            <td>
                              {description || (isTotal ? "TOTAL BOBOT" : "")}
                            </td>
                            <td>{isSummary ? "" : row[10]?.trim() || ""}</td>
                            <td>{isSummary ? "" : row[11]?.trim() || ""}</td>
                            <td>
                              {isSummary
                                ? ""
                                : isSection
                                ? row[9]?.trim()
                                : row[12]?.trim() || ""}
                            </td>
                            {dailyCells.map((cell, dayIndex) => (
                              <td key={`day-${dayIndex}`}>{cell.trim()}</td>
                            ))}
                            <td>{row[44]?.trim() || ""}</td>
                          </tr>
                        );
                      })}
                      {filteredProgressRows.length === 0 && (
                        <tr>
                          <td
                            className="progress-empty-row"
                            colSpan={progressData.dayLabels.length + 6}
                          >
                            Tidak ada item yang cocok dengan pencarian.
                          </td>
                        </tr>
                      )}
                    </tbody>
                      </table>
                    </div>
                  </>
                )}
              </>
            )}
        </div>

        <button
          type="button"
          className="page-next-button"
          onClick={() => onNavigate("experience")}
        >
          Kembali ke List Project →
        </button>
      </div>
    </section>
  );
}

function ProjectBastPage({ projectTitle, onNavigate }) {
  const requestedProjectTitle =
    projectTitle || getRouteFromLocation().projectTitle;
  const BAST_CSV_URL =
    "https://docs.google.com/spreadsheets/d/1WA_wMChzfqicu5i5uTK-qgPmpQcnGbMArWWKMIDipXU/export?format=csv&gid=0";
  const SPREADSHEET_URL =
    "https://docs.google.com/spreadsheets/d/1WA_wMChzfqicu5i5uTK-qgPmpQcnGbMArWWKMIDipXU/edit?pli=1&gid=0#gid=0";
  const bastColumns = [
    { group: "No Dokumen", stage: "2", index: 8 },
    { group: "No Dokumen", stage: "3", index: 9 },
    { group: "No Dokumen", stage: "4", index: 10 },
    { group: "Status Pembuatan Dokumen", stage: "2", index: 11 },
    { group: "Status Pembuatan Dokumen", stage: "3", index: 12 },
    { group: "Status Pembuatan Dokumen", stage: "4", index: 13 },
    { group: "Catatan 1", stage: "", index: 14 },
    { group: "Status Sign Properti", stage: "2", index: 15 },
    { group: "Status Sign Properti", stage: "3", index: 16 },
    { group: "Status Sign Properti", stage: "4", index: 17 },
    { group: "Catatan 2", stage: "", index: 18 },
    { group: "Dokumen", stage: "2", index: 19 },
    { group: "Dokumen", stage: "3", index: 20 },
    { group: "Dokumen", stage: "4", index: 21 },
  ];

  const [projects, setProjects] = useState([]);
  const [selectedProject, setSelectedProject] = useState(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    if (!requestedProjectTitle) {
      setSelectedProject(null);
      return;
    }

    const normalizedTitle = normalizeProjectName(requestedProjectTitle);
    const matchingProject = projects.find(
      (project) => project.normalizedName === normalizedTitle,
    );
    setSelectedProject(matchingProject || null);
  }, [requestedProjectTitle, projects]);

  useEffect(() => {
    let isMounted = true;
    setLoading(true);
    setError("");

    const loadBastReport = async () => {
      try {
        const response = await fetch(BAST_CSV_URL, {
          cache: "no-store",
        });
        if (!response.ok) {
          throw new Error("Gagal mengambil data spreadsheet BAST.");
        }

        const rows = parseCsvRows(await response.text());
        const header = rows[0] || [];
        if (
          header[1]?.trim().toLowerCase() !== "properti" ||
          header[8]?.trim().toLowerCase() !== "no dokumen"
        ) {
          throw new Error("Format sheet Report BAST tidak ditemukan.");
        }

        const projectsByName = new Map();
        rows.slice(1).forEach((row) => {
          const name = row[1]?.trim();
          const normalizedName = normalizeProjectName(name);
          if (!name || !normalizedName) {
            return;
          }

          const project = projectsByName.get(normalizedName);
          if (project) {
            project.rows.push(row);
          } else {
            projectsByName.set(normalizedName, {
              name,
              normalizedName,
              rows: [row],
            });
          }
        });
        const projectGroups = Array.from(projectsByName.values());

        if (projectGroups.length === 0) {
          throw new Error("Daftar project pada sheet Report BAST kosong.");
        }

        if (isMounted) {
          setProjects(projectGroups);
        }
      } catch (loadError) {
        console.error("Error loading project BAST report:", loadError);
        if (isMounted) {
          setError(loadError.message || "Gagal memuat data Report BAST.");
        }
      } finally {
        if (isMounted) {
          setLoading(false);
        }
      }
    };

    void loadBastReport();

    return () => {
      isMounted = false;
    };
  }, []);

  const filteredProjects = projects.filter((project) =>
    project.name.toLowerCase().includes(searchTerm.trim().toLowerCase()),
  );
  const requestedProjectNotFound =
    !loading &&
    !error &&
    requestedProjectTitle &&
    projects.length > 0 &&
    !projects.some(
      (project) =>
        project.normalizedName === normalizeProjectName(requestedProjectTitle),
    );

  const columnGroups = bastColumns.reduce((groups, column) => {
    const previousGroup = groups[groups.length - 1];
    if (previousGroup?.label === column.group) {
      previousGroup.columns.push(column);
    } else {
      groups.push({ label: column.group, columns: [column] });
    }
    return groups;
  }, []);

  return (
    <section className="bast-report-page">
      <div className="section-container">
        <div className="bast-report-heading">
          <div>
            <span className="achievement-label">
              {selectedProject ? "PROJECT TERPILIH" : "DAFTAR PROJECT"}
            </span>
            <h2>
              {selectedProject ? selectedProject.name : "Pilih Project"}
            </h2>
          </div>
          <a
            className="progress-source-link"
            href={SPREADSHEET_URL}
            target="_blank"
            rel="noreferrer"
          >
            Buka Spreadsheet ↗
          </a>
        </div>

        {loading && (
          <p className="bast-report-message">Memuat data Report BAST...</p>
        )}

        {!loading && error && (
          <p className="bast-report-message bast-report-error">{error}</p>
        )}

        {requestedProjectNotFound && (
          <div className="bast-report-message bast-report-error">
            Data BAST untuk project “{requestedProjectTitle}” belum ditemukan.
            <button
              className="bast-back-button"
              onClick={() => onNavigate("contact")}
              type="button"
            >
              ← Kembali ke daftar project
            </button>
          </div>
        )}

        {!loading && !error && !requestedProjectTitle && !selectedProject && (
          <div className="bast-project-picker">
            <label htmlFor="bast-project-search">Cari nama project</label>
            <input
              id="bast-project-search"
              type="search"
              value={searchTerm}
              onChange={(event) => setSearchTerm(event.target.value)}
              placeholder="Ketik nama project..."
            />
            <p className="bast-project-count" aria-live="polite">
              Menampilkan {filteredProjects.length} dari {projects.length} project
            </p>
            {filteredProjects.length > 0 ? (
              <div className="bast-project-list">
                {filteredProjects.map((project) => (
                  <button
                    className="bast-project-item"
                    key={project.normalizedName}
                    onClick={() => setSelectedProject(project)}
                    type="button"
                  >
                    <span className="bast-project-name">{project.name}</span>
                    <span className="bast-project-meta">
                      {project.rows.length} data{" "}
                      <span aria-hidden="true">→</span>
                    </span>
                  </button>
                ))}
              </div>
            ) : (
              <p className="bast-report-message bast-project-empty">
                Project dengan nama “{searchTerm}” tidak ditemukan.
              </p>
            )}
          </div>
        )}

        {!loading && !error && selectedProject && (
          <>
            <button
              className="bast-back-button"
              onClick={() => onNavigate("contact")}
              type="button"
            >
              ← Kembali ke daftar project
            </button>
            <div className="bast-table-scroll">
              <table className="bast-table">
                <thead>
                  <tr>
                    {columnGroups.map((group) => (
                      <th key={group.label} colSpan={group.columns.length}>
                        {group.label}
                      </th>
                    ))}
                  </tr>
                  <tr>
                    {bastColumns.map((column) => (
                      <th key={`${column.index}-stage`}>
                        {column.stage || "—"}
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {selectedProject.rows.map((row, rowIndex) => (
                    <tr key={`${selectedProject.normalizedName}-${rowIndex}`}>
                      {bastColumns.map((column) => {
                        const value = row[column.index]?.trim() || "";
                        const statusClass =
                          /^(done|pending|on proses)$/i.test(value)
                            ? ` bast-status-${value
                                .toLowerCase()
                                .replace(/\s+/g, "-")}`
                            : "";

                        return (
                          <td
                            key={`${column.index}-value`}
                            className={`bast-cell${statusClass}`}
                          >
                            {value || "—"}
                          </td>
                        );
                      })}
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </>
        )}

        <button
          type="button"
          className="page-next-button"
          onClick={() => onNavigate("experience")}
        >
          Kembali ke List Project →
        </button>
      </div>
    </section>
  );
}

/* =========================================================
   AWARDS PAGE
========================================================= */

function AwardsPage({
  awards,
  selectedAward,
  leadership,
  onAwardChange,
  onOpenImage,
  onOpenCertificate,
}) {
  if (!selectedAward) {
    return (
      <section className="awards-page">
        <div className="awards-container">
          <div className="awards-header">
            <div className="awards-header-left">
              <span className="awards-index">03</span>
              <span className="awards-label">AWARDS & ACHIEVEMENTS</span>
            </div>
          </div>
          <div className="award-detail">
            <p>No awards data found in database.</p>
          </div>
        </div>
      </section>
    );
  }

  return (
    <section className="awards-page">
      <div className="awards-container">
        <div className="awards-header">
          <div className="awards-header-left">
            <span className="awards-index">03</span>
            <span className="awards-label">AWARDS & ACHIEVEMENTS</span>
          </div>

          <div className="awards-header-right">
            <h2>
              Recognition
              <br />
              <span>Beyond Engineering.</span>
            </h2>
            <p>
              Selected achievements from engineering competitions, teamwork,
              leadership, and technical activities.
            </p>
          </div>
        </div>

        <div className="awards-interactive">
          <div className="awards-selector">
            {awards.map((award) => (
              <button
                key={award.id}
                type="button"
                className={`award-selector-item ${
                  selectedAward.id === award.id ? "active" : ""
                }`}
                onClick={() => onAwardChange(award)}
              >
                <div className="selector-year">{award.year}</div>
                <div className="selector-content">
                  <span>{award.type}</span>
                  <h3>{award.title}</h3>
                  <strong>{award.result}</strong>
                </div>
                <div className="selector-arrow">↗</div>
              </button>
            ))}
          </div>

          <div className="award-detail">
            <div className="award-detail-top">
              <div>
                <span className="award-detail-type">{selectedAward.type}</span>
                <span className="award-detail-year">{selectedAward.year}</span>
              </div>
              <span className="award-detail-number">
                {selectedAward.number}
              </span>
            </div>

            <div className="award-detail-main">
              <div className="award-detail-rank">
                <span>{selectedAward.rank}</span>
                <small>{selectedAward.suffix}</small>
              </div>

              <div className="award-detail-info">
                <h3>{selectedAward.title}</h3>
                <p className="award-detail-result">{selectedAward.result}</p>
                <div className="award-detail-location">
                  <span>{selectedAward.location}</span>
                  <span>{selectedAward.country}</span>
                </div>
              </div>
            </div>

            <div className="award-evidence">
              <div className="evidence-header">
                <span>VISUAL EVIDENCE</span>
                <span>{selectedAward.year}</span>
              </div>
              <button
                type="button"
                className="evidence-image"
                onClick={onOpenImage}
              >
                <img
                  src={getSafeImageUrl(selectedAward.image)}
                  alt={selectedAward.title}
                  onError={handleImageFallback}
                />
              </button>
            </div>
          </div>
        </div>

        {leadership && (
          <div className="awards-leadership">
            <div className="awards-section-heading">
              <div>
                <span>LEADERSHIP</span>
                <h3>
                  Leadership & Organizational
                  <br />
                  <em>Recognition.</em>
                </h3>
              </div>
              <span className="leadership-index">04</span>
            </div>

            <div className="leadership-overview">
              <div className="leadership-info">
                <span className="leadership-organization">
                  {leadership.organization}
                </span>
                <h4>{leadership.position}</h4>
                <span className="leadership-period">{leadership.period}</span>
              </div>

              <div className="leadership-description">
                <p>
                  Leadership experience developed through progressive
                  responsibilities in electrical engineering, technical
                  coordination, and team management.
                </p>
              </div>
            </div>

            <div className="leadership-certificates">
              <div className="leadership-certificates-header">
                <span>CERTIFICATES OF APPRECIATION</span>
                <span>
                  {String(leadership.certificates?.length || 0).padStart(
                    2,
                    "0",
                  )}{" "}
                  DOCUMENTS
                </span>
              </div>

              <div className="leadership-certificate-grid">
                {leadership.certificates?.map((certificate, index) => (
                  <article className="leadership-certificate-card" key={index}>
                    <button
                      type="button"
                      className="leadership-certificate-image"
                      onClick={() => onOpenCertificate(certificate)}
                    >
                      <img
                        src={getSafeImageUrl(certificate.image)}
                        alt={`${certificate.title} - ${certificate.role}`}
                        onError={handleImageFallback}
                      />
                      <span className="certificate-view">VIEW ↗</span>
                    </button>

                    <div className="leadership-certificate-meta">
                      <span>{String(index + 1).padStart(2, "0")}</span>
                      <div>
                        <strong>{certificate.title}</strong>
                        <p>{certificate.role}</p>
                      </div>
                    </div>
                  </article>
                ))}
              </div>
            </div>
          </div>
        )}
      </div>
    </section>
  );
}

/* =========================================================
   CERTIFICATIONS PAGE
========================================================= */

function CertificationsPage({ onNavigate }) {
  return (
    <section className="certifications-page">
      <div className="section-container">
        {/* =================================================
            HEADER
        ================================================= */}

        <div className="section-heading">
          <span className="section-number">04</span>

          <div>
            <p className="section-label">CERTIFICATIONS</p>

            <h2>
              Professional
              <br />
              <span>Certifications & Credentials.</span>
            </h2>
          </div>
        </div>

        {/* =================================================
            INTRO
        ================================================= */}

        <div className="certifications-intro">
          <p>
            Professional certifications, training records, and technical
            credentials will be presented in this section.
          </p>
        </div>

        {/* =================================================
            EMPTY CERTIFICATION PANEL
        ================================================= */}

        <div className="certifications-panel">
          <div className="certifications-panel-header">
            <span>PROFESSIONAL CREDENTIALS</span>

            <span>00 DOCUMENTS</span>
          </div>

          <div className="certifications-empty">
            <div className="certifications-empty-number">04</div>

            <div className="certifications-empty-content">
              <span>CERTIFICATIONS</span>

              <h3>Credentials will be added here.</h3>

              <p>
                This section is intentionally prepared for professional
                certifications, technical training, competency certificates, and
                other relevant credentials.
              </p>
            </div>

            <div className="certifications-empty-status">COMING SOON</div>
          </div>
        </div>

        {/* =================================================
            CERTIFICATION CATEGORIES
        ================================================= */}

        <div className="certification-categories">
          <div className="certification-category">
            <span>01</span>

            <div>
              <strong>ENGINEERING</strong>

              <p>Engineering and technical certifications.</p>
            </div>
          </div>

          <div className="certification-category">
            <span>02</span>

            <div>
              <strong>SAFETY</strong>

              <p>Safety and site-related credentials.</p>
            </div>
          </div>

          <div className="certification-category">
            <span>03</span>

            <div>
              <strong>TECHNICAL TRAINING</strong>

              <p>Technical courses and competency training.</p>
            </div>
          </div>
        </div>

        {/* =================================================
            NEXT
        ================================================= */}

        <button
          type="button"
          className="page-next-button"
          onClick={() => onNavigate("contact")}
        >
          Let's Connect →
        </button>
      </div>
    </section>
  );
}

/* =========================================================
   CONTACT PAGE
========================================================= */

function ContactPage({ onNavigate }) {
  return (
    <section className="contact-page">
      <div className="contact-container">
        <div className="section-heading">
          <span className="section-number">05</span>

          <div>
            <p className="section-label">CONTACT</p>

            <h2>
              Let's Build
              <br />
              <span>Something Meaningful.</span>
            </h2>
          </div>
        </div>

        <div className="contact-content">
          <div className="contact-message">
            <p>
              Interested in discussing engineering, project opportunities,
              technical work, or potential collaboration?
            </p>

            <a href="mailto:your@email.com" className="contact-email">
              your@email.com ↗
            </a>
          </div>

          <div className="contact-details">
            <div>
              <span>LOCATION</span>

              <strong>Yogyakarta, Indonesia</strong>
            </div>

            <div>
              <span>FIELD</span>

              <strong>Electrical & Instrumentation</strong>
            </div>

            <div>
              <span>AVAILABILITY</span>

              <strong>Open to Opportunities</strong>
            </div>
          </div>
        </div>

        <button
          type="button"
          className="page-next-button"
          onClick={() => onNavigate("home")}
        >
          Back to Home →
        </button>
      </div>
    </section>
  );
}

/* =========================================================
   EXPORT
========================================================= */

export default App;
