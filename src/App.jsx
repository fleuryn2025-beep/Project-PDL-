import { useEffect, useState } from "react";
import "./App.css";

/* =========================================================
   AWARDS DATA
========================================================= */

const awards = [
  {
    id: "shell-2024",
    year: "2024",
    number: "01",
    rank: "03",
    suffix: "RD",
    type: "INTERNATIONAL COMPETITION",
    title: "Shell Eco-marathon Asia Pacific & Middle East",
    result: "3rd Place",
    location: "MANDALIKA INTERNATIONAL CIRCUIT",
    country: "LOMBOK · INDONESIA",
    image: `${import.meta.env.BASE_URL}awards/shell-eco-2024/WPS Photo.jpeg`,
  },

  {
    id: "kmhe-2024",
    year: "2024",
    number: "02",
    rank: "03",
    suffix: "RD",
    type: "NATIONAL COMPETITION",
    title: "Kontes Mobil Hemat Energi",
    result: "3rd Place",
    location: "JAKARTA E-PRIX CIRCUIT",
    country: "JAKARTA · INDONESIA",
    image: `${import.meta.env.BASE_URL}awards/KMHE-2024/WPS Photo(5).jpeg`,
  },

  {
    id: "shell-2023",
    year: "2023",
    number: "03",
    rank: "07",
    suffix: "TH",
    type: "INTERNATIONAL COMPETITION",
    title: "Shell Eco-marathon Asia Pacific & Middle East",
    result: "7th Place",
    location: "MANDALIKA INTERNATIONAL CIRCUIT",
    country: "LOMBOK · INDONESIA",
    image: `${import.meta.env.BASE_URL}awards/shell-eco-2023/WPS Photo(4).jpeg`,
  },

  {
    id: "pupr-2022",
    year: "2022",
    number: "04",
    rank: "03",
    suffix: "RD",
    type: "NATIONAL COMPETITION",
    title: "PUPR Electric Vehicle Time Attack Competition",
    result: "3rd Place",
    location: "BANDUNG",
    country: "INDONESIA",
    image: `${import.meta.env.BASE_URL}awards/pupr-2022/WPS Photo(1).jpeg`,
  },

  {
    id: "pkm-kc-2022",
    year: "2022",
    number: "05",
    rank: "—",
    suffix: "",
    type: "NATIONAL PROGRAM",
    title: "PKM-KC",
    result: "Participant / Achievement",
    location: "INDONESIA",
    country: "",
    image: `${import.meta.env.BASE_URL}awards/pkm-kc-2022/WPS Photo(2).jpeg`,
  },
];


/* =========================================================
   LEADERSHIP DATA
========================================================= */

const leadership = {
  organization: "KHAD ECO TEAM UMY",

  position:
    "Electrical Staff → Chief Electrical → Deputy General Manager",

  period: "2021 — 2024",

  certificates: [
    {
      title: "Certificate of Appreciation",
      role: "Deputy General Manager",
      image: `${import.meta.env.BASE_URL}awards/leadership/WPS Photo(8).jpeg`,
    },

    {
      title: "Certificate of Appreciation",
      role: "Leadership Achievement",
      image: `${import.meta.env.BASE_URL}awards/leadership/WPS Photo(9).jpeg`,
    },

    {
      title: "Certificate of Appreciation",
      role: "Leadership Achievement",
      image: `${import.meta.env.BASE_URL}awards/leadership/WPS Photo(10).jpeg`,
    },
  ],
};


/* =========================================================
   NAVIGATION
========================================================= */

const navigation = [
  {
    id: "home",
    label: "Home",
  },

  {
    id: "about",
    label: "About",
  },

  {
    id: "experience",
    label: "Experience",
  },

  {
    id: "awards",
    label: "Awards",
  },

  {
    id: "certifications",
    label: "Certifications",
  },

  {
    id: "contact",
    label: "Contact",
  },
];


/* =========================================================
   APP
========================================================= */

function App() {
  const [activePage, setActivePage] = useState("home");

  const [selectedAward, setSelectedAward] = useState(
    awards[0]
  );

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

  const changePage = (page) => {
    setActivePage(page);

    window.scrollTo({
      top: 0,
      behavior: "smooth",
    });
  };


  /* =======================================================
     RESET IMAGE
  ======================================================= */

  const resetImage = () => {
    setImageZoom(1);

    setImagePosition({
      x: 0,
      y: 0,
    });
  };


  /* =======================================================
     OPEN IMAGE
  ======================================================= */

  const openImage = (image, title) => {
    setLightboxImage(image);
    setLightboxTitle(title);

    resetImage();

    setIsImageOpen(true);
  };


  /* =======================================================
     OPEN AWARD IMAGE
  ======================================================= */

  const openAwardImage = () => {
    openImage(
      selectedAward.image,
      selectedAward.title
    );
  };


  /* =======================================================
     OPEN CERTIFICATE
  ======================================================= */

  const openLeadershipCertificate = (certificate) => {
    openImage(
      certificate.image,
      `${certificate.title} — ${certificate.role}`
    );
  };


  /* =======================================================
     CLOSE IMAGE
  ======================================================= */

  const closeImage = () => {
    setIsImageOpen(false);

    setLightboxImage(null);

    setLightboxTitle("");

    resetImage();
  };


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
    setImageZoom((currentZoom) =>
      Math.min(
        4,
        currentZoom + 0.25
      )
    );
  };


  /* =======================================================
     ZOOM OUT
  ======================================================= */

  const zoomOut = () => {
    setImageZoom((currentZoom) => {
      const newZoom = Math.max(
        0.5,
        currentZoom - 0.25
      );

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
      setImageZoom((currentZoom) =>
        Math.min(
          4,
          currentZoom + 0.15
        )
      );

      return;
    }

    setImageZoom((currentZoom) => {
      const newZoom = Math.max(
        0.5,
        currentZoom - 0.15
      );

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
      x:
        event.clientX -
        imagePosition.x,

      y:
        event.clientY -
        imagePosition.y,
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
      x:
        event.clientX -
        dragStart.x,

      y:
        event.clientY -
        dragStart.y,
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

    document.addEventListener(
      "keydown",
      handleEscape
    );

    return () => {
      document.removeEventListener(
        "keydown",
        handleEscape
      );
    };
  }, []);


  /* =======================================================
     LOCK BODY SCROLL
  ======================================================= */

  useEffect(() => {
    if (isImageOpen) {
      document.body.style.overflow =
        "hidden";
    } else {
      document.body.style.overflow =
        "";
    }

    return () => {
      document.body.style.overflow =
        "";
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
        return (
          <HomePage
            onNavigate={changePage}
          />
        );


      /* ===================================================
         ABOUT
      =================================================== */

      case "about":
        return (
          <AboutPage
            onNavigate={changePage}
          />
        );


      /* ===================================================
         EXPERIENCE
      =================================================== */

      case "experience":
        return (
          <ExperiencePage
            onNavigate={changePage}
          />
        );


      /* ===================================================
         AWARDS
      =================================================== */

      case "awards":
        return (
          <AwardsPage
            awards={awards}
            selectedAward={selectedAward}
            onAwardChange={handleAwardChange}
            onOpenImage={openAwardImage}
            onOpenCertificate={
              openLeadershipCertificate
            }
            onNavigate={changePage}
          />
        );


      /* ===================================================
         CERTIFICATIONS
      =================================================== */

      case "certifications":
        return (
          <CertificationsPage
            onNavigate={changePage}
            onOpenCertificate={
              openLeadershipCertificate
            }
          />
        );


      /* ===================================================
         CONTACT
      =================================================== */

      case "contact":
        return (
          <ContactPage
            onNavigate={changePage}
          />
        );


      default:
        return (
          <HomePage
            onNavigate={changePage}
          />
        );
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

          <button
            type="button"
            className="logo"
            onClick={() =>
              changePage("home")
            }
          >
            ISNAINI ADI SANTOSO
          </button>


          <nav
            className="nav-menu"
            aria-label="Primary navigation"
          >

            {navigation.map((item) => (
              <button
                key={item.id}
                type="button"
                className={
                  activePage === item.id
                    ? "active"
                    : ""
                }
                onClick={() =>
                  changePage(item.id)
                }
              >
                {item.label}
              </button>
            ))}

          </nav>


          <button
            type="button"
            className="resume-button"
          >
            Resume ↗
          </button>

        </div>

      </header>


      {/* =================================================
          PAGE
      ================================================= */}

      <main className="page-content">

        {renderPage()}

      </main>


      {/* =================================================
          IMAGE LIGHTBOX
      ================================================= */}

      {isImageOpen &&
        lightboxImage && (

          <div
            className="image-lightbox"
            onClick={closeImage}
          >

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
              onClick={(event) =>
                event.stopPropagation()
              }
            >

              <div className="zoom-controls">

                <button
                  type="button"
                  onClick={zoomOut}
                >
                  −
                </button>


                <span>
                  {Math.round(
                    imageZoom * 100
                  )}
                  %
                </span>


                <button
                  type="button"
                  onClick={zoomIn}
                >
                  +
                </button>


                <button
                  type="button"
                  onClick={resetImage}
                >
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
                  src={lightboxImage}
                  alt={lightboxTitle}
                  draggable="false"
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

          <p className="hero-label">
            ELECTRICAL ENGINEER • PROJECT ENGINEER
          </p>


          <h1>
            Engineering
            <br />
            <span>
              Ideas Into Reality.
            </span>
          </h1>


          <p className="hero-description">
            Electrical Engineering professional with
            experience in project engineering, electrical
            systems, instrumentation, maintenance, and
            technical project coordination.
          </p>


          <div className="hero-buttons">

            <button
              type="button"
              className="primary-button"
              onClick={() =>
                onNavigate("experience")
              }
            >
              Explore My Work
              <span>↗</span>
            </button>


            <button
              type="button"
              className="secondary-button"
              onClick={() =>
                onNavigate("contact")
              }
            >
              Let's Connect
            </button>

          </div>


          <div className="hero-stats">

            <div className="stat">
              <strong>02+</strong>
              <span>Years Experience</span>
            </div>


            <div className="stat">
              <strong>10+</strong>
              <span>Projects</span>
            </div>


            <div className="stat">
              <strong>03+</strong>
              <span>Industries</span>
            </div>

          </div>

        </div>


        <div className="hero-visual">

          <div className="visual-grid"></div>


          <div className="engineer-card">

            <div className="card-top">
              <span>ENGINEERING</span>
              <span>01</span>
            </div>


            <div className="engineer-symbol">
              ⚡
            </div>


            <div className="card-bottom">
              <span>ELECTRICAL</span>
              <span>PROJECTS</span>
            </div>

          </div>


          <div className="floating-tag tag-one">
            Electrical
          </div>


          <div className="floating-tag tag-two">
            Instrumentation
          </div>


          <div className="floating-tag tag-three">
            Project Engineering
          </div>

        </div>

      </div>

    </section>
  );
}


/* =========================================================
   ABOUT PAGE
========================================================= */

function AboutPage({ onNavigate }) {
  return (
    <section className="about-page">

      <div className="section-container">

        <div className="section-heading">

          <span className="section-number">
            01
          </span>


          <div>
            <p className="section-label">
              ABOUT ME
            </p>

            <h2>
              Electrical Engineering
              <br />
              <span>
                with a Project Mindset.
              </span>
            </h2>
          </div>

        </div>


        <div className="about-grid">

          <div className="about-intro">

            <p className="about-lead">
              I am an Electrical & Instrumentation
              Engineer with experience across engineering,
              EPC Oil & Gas, power generation,
              manufacturing, and electrical project
              execution.
            </p>


            <p className="about-text">
              My experience covers electrical systems,
              instrumentation, industrial automation,
              maintenance, installation, inspection,
              testing, commissioning, and technical
              project coordination.
            </p>


            <p className="about-text">
              I enjoy working between engineering and
              field execution — translating technical
              requirements into practical solutions while
              coordinating with project teams, vendors,
              subcontractors, and site personnel.
            </p>

          </div>


          <div className="about-details">

            <div className="detail-card">

              <span className="detail-label">
                EDUCATION
              </span>

              <h3>
                Bachelor of Electrical Engineering
              </h3>

              <p>
                Universitas Muhammadiyah Yogyakarta
              </p>

              <strong>
                GPA 3.72 / 4.00
              </strong>

            </div>


            <div className="detail-card">

              <span className="detail-label">
                CORE FOCUS
              </span>


              <div className="focus-list">

                <span>
                  Electrical Engineering
                </span>

                <span>
                  Instrumentation
                </span>

                <span>
                  Industrial Automation
                </span>

                <span>
                  Project Engineering
                </span>

                <span>
                  Testing & Commissioning
                </span>

                <span>
                  Technical Coordination
                </span>

              </div>

            </div>


            <div className="detail-card">

              <span className="detail-label">
                PROFESSIONAL APPROACH
              </span>

              <p className="approach-text">
                Analytical, detail-oriented, adaptable,
                and comfortable working independently
                or within multidisciplinary teams.
              </p>

            </div>

          </div>

        </div>


        <div className="about-footer">

          <div>
            <span>BASED IN</span>
            <strong>
              Yogyakarta, Indonesia
            </strong>
          </div>


          <div>
            <span>AVAILABILITY</span>
            <strong>
              Open to Opportunities
            </strong>
          </div>


          <div>
            <span>ENGINEERING</span>
            <strong>
              Electrical • Instrumentation • Projects
            </strong>
          </div>

        </div>


        <button
          type="button"
          className="page-next-button"
          onClick={() =>
            onNavigate("experience")
          }
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

function ExperiencePage({ onNavigate }) {

  const experiences = [
    {
      number: "01",
      date: "APR 2025 — MAR 2026",
      location: "MINAS, RIAU",
      title: "Electrical & Instrumentation Project Engineer",
      company: "PT Geoservices — KSO UGDT",
      project: "Pertamina Hulu Rokan",

      description:
        "Supported Electrical & Instrumentation engineering activities throughout project execution, including technical coordination, field verification, inspection, testing, commissioning, and technical documentation.",

      tags: [
        "E&I Engineering",
        "Project Coordination",
        "Field Inspection",
        "Testing & Commissioning",
        "Vendor Coordination",
      ],

      achievements: [
        "Supported execution of Electrical & Instrumentation activities for the CEOR A / Surfactant project.",
        "Successfully coordinated 3 subcontractors during Electrical & Instrumentation project execution.",
        "Contributed to project execution through field verification, coordination, and commissioning support.",
      ],
    },


    {
      number: "02",
      date: "JAN 2025 — APR 2025",
      location: "YOGYAKARTA",
      title: "Engineering",
      company: "PT Sinergi Integra Service",

      description:
        "Performed electrical Preventive Maintenance and Corrective Maintenance while supervising vendors and subcontractors during maintenance and technical activities.",

      tags: [
        "Preventive Maintenance",
        "Corrective Maintenance",
        "Electrical Troubleshooting",
        "Vendor Supervision",
      ],

      achievements: [
        "Successfully supervised and coordinated vendor activities during electrical maintenance work.",
        "Supported PM and CM activities to maintain electrical equipment reliability.",
      ],
    },


    {
      number: "03",
      date: "JAN 2024 — FEB 2025",
      location: "PROBOLINGGO",
      title: "Electrical Engineering Intern",
      company: "PT YTL Jawa Timur",
      project: "PLTU Paiton Units 5 & 6",

      description:
        "Supported electrical system maintenance, inspection, testing, troubleshooting, and field activities within a power generation environment.",

      tags: [
        "Power Generation",
        "Electrical Maintenance",
        "Inspection & Testing",
        "Troubleshooting",
      ],

      achievements: [
        "Gained practical experience in electrical maintenance supporting reliability and operation of power generation systems.",
      ],
    },


    {
      number: "04",
      date: "2021 — 2022",
      location: "YOGYAKARTA",
      title: "Electrical Technician",
      company: "CV Bintoro",

      description:
        "Performed Preventive Maintenance and Corrective Maintenance, electrical inspection, testing, measurement, troubleshooting, installation, and repair activities.",

      tags: [
        "Electrical Maintenance",
        "PM & CM",
        "Electrical Testing",
        "Troubleshooting",
      ],

      achievements: [
        "Supported PM and CM activities to maintain electrical equipment reliability.",
      ],
    },


    {
      number: "05",
      date: "AUG 2020 — JUL 2021",
      location: "SOUTH TANGERANG",
      title: "Electrical Technician & Site Engineer",
      company: "PT Sinar Tekindo Mandiri",

      description:
        "Performed electrical panel assembly and wiring, site inspections, electrical installation, testing, commissioning, generator commissioning, and synchronization activities.",

      tags: [
        "Panel Assembly",
        "Electrical Installation",
        "Generator",
        "Commissioning",
        "Site Engineering",
      ],

      achievements: [
        "Electrical system installation and testing at Embarcadero Park, Cilandak.",
        "Electrical system installation and testing at The Holland Village, Cempaka Putih, Jakarta.",
        "Participated in large-scale generator commissioning and synchronization at an apartment project in Karawaci.",
      ],
    },
  ];


  return (
    <section className="experience-page">

      <div className="section-container">

        <div className="section-heading">

          <span className="section-number">
            02
          </span>


          <div>

            <p className="section-label">
              PROFESSIONAL EXPERIENCE
            </p>


            <h2>
              Experience Built
              <br />
              <span>
                Through Field & Engineering.
              </span>
            </h2>

          </div>

        </div>


        <div className="experience-intro">

          <p>
            My professional experience spans Electrical &
            Instrumentation Engineering, project execution,
            electrical maintenance, power generation,
            installation, testing, commissioning, and
            site engineering.
          </p>

        </div>


        <div className="experience-timeline">

          {experiences.map((experience) => (

            <article
              className="experience-item"
              key={experience.number}
            >

              <div className="experience-marker">
                {experience.number}
              </div>


              <div className="experience-content">

                <div className="experience-meta">

                  <span>
                    {experience.date}
                  </span>

                  <span>
                    {experience.location}
                  </span>

                </div>


                <h3>
                  {experience.title}
                </h3>


                <h4>
                  {experience.company}
                </h4>


                {experience.project && (
                  <p className="experience-location">
                    {experience.project}
                  </p>
                )}


                <p className="experience-description">
                  {experience.description}
                </p>


                <div className="experience-tags">

                  {experience.tags.map((tag) => (
                    <span key={tag}>
                      {tag}
                    </span>
                  ))}

                </div>


                <div className="experience-achievement">

                  <span className="achievement-label">
                    KEY ACHIEVEMENTS
                  </span>


                  <ul>

                    {experience.achievements.map(
                      (achievement) => (
                        <li key={achievement}>
                          {achievement}
                        </li>
                      )
                    )}

                  </ul>

                </div>

              </div>

            </article>

          ))}

        </div>


        <div className="experience-summary">

          <div className="summary-item">
            <strong>05</strong>
            <span>Professional Roles</span>
          </div>


          <div className="summary-item">
            <strong>E&I</strong>
            <span>Primary Engineering Focus</span>
          </div>


          <div className="summary-item">
            <strong>EPC</strong>
            <span>Project Environment</span>
          </div>


          <div className="summary-item">
            <strong>FIELD</strong>
            <span>Execution Experience</span>
          </div>

        </div>


        <button
          type="button"
          className="page-next-button"
          onClick={() =>
            onNavigate("awards")
          }
        >
          View Awards →
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
  onAwardChange,
  onOpenImage,
  onOpenCertificate,
  onNavigate,
}) {

  return (
    <section className="awards-page">

      <div className="awards-container">

        {/* =================================================
            HEADER
        ================================================= */}

        <div className="awards-header">

          <div className="awards-header-left">

            <span className="awards-index">
              03
            </span>

            <span className="awards-label">
              AWARDS & ACHIEVEMENTS
            </span>

          </div>


          <div className="awards-header-right">

            <h2>
              Recognition
              <br />
              <span>
                Beyond Engineering.
              </span>
            </h2>


            <p>
              Selected achievements from engineering
              competitions, teamwork, leadership, and
              technical activities.
            </p>

          </div>

        </div>


        {/* =================================================
            AWARD INTERACTIVE
        ================================================= */}

        <div className="awards-interactive">

          <div className="awards-selector">

            {awards.map((award) => (

              <button
                key={award.id}
                type="button"
                className={`award-selector-item ${
                  selectedAward.id === award.id
                    ? "active"
                    : ""
                }`}
                onClick={() =>
                  onAwardChange(award)
                }
              >

                <div className="selector-year">
                  {award.year}
                </div>


                <div className="selector-content">

                  <span>
                    {award.type}
                  </span>


                  <h3>
                    {award.title}
                  </h3>


                  <strong>
                    {award.result}
                  </strong>

                </div>


                <div className="selector-arrow">
                  ↗
                </div>

              </button>

            ))}

          </div>


          <div className="award-detail">

            <div className="award-detail-top">

              <div>

                <span className="award-detail-type">
                  {selectedAward.type}
                </span>


                <span className="award-detail-year">
                  {selectedAward.year}
                </span>

              </div>


              <span className="award-detail-number">
                {selectedAward.number}
              </span>

            </div>


            <div className="award-detail-main">

              <div className="award-detail-rank">

                <span>
                  {selectedAward.rank}
                </span>


                <small>
                  {selectedAward.suffix}
                </small>

              </div>


              <div className="award-detail-info">

                <h3>
                  {selectedAward.title}
                </h3>


                <p className="award-detail-result">
                  {selectedAward.result}
                </p>


                <div className="award-detail-location">

                  <span>
                    {selectedAward.location}
                  </span>


                  <span>
                    {selectedAward.country}
                  </span>

                </div>

              </div>

            </div>


            {/* =================================================
                VISUAL EVIDENCE
            ================================================= */}

            <div className="award-evidence">

              <div className="evidence-header">

                <span>
                  VISUAL EVIDENCE
                </span>

                <span>
                  {selectedAward.year}
                </span>

              </div>


              <button
                type="button"
                className="evidence-image"
                onClick={onOpenImage}
              >

                <img
                  src={selectedAward.image}
                  alt={selectedAward.title}
                />

              </button>

            </div>


            {/* =================================================
                CERTIFICATE PLACEHOLDER
            ================================================= */}

            <div className="award-certificate">

              <div>

                <span>
                  CERTIFICATE
                </span>


                <p>
                  Official certificate will be
                  displayed here.
                </p>

              </div>


              <span className="certificate-status">
                COMING SOON
              </span>

            </div>

          </div>

        </div>


        {/* =================================================
            LEADERSHIP
        ================================================= */}

        <div className="awards-leadership">

          <div className="awards-section-heading">

            <div>

              <span>
                LEADERSHIP
              </span>


              <h3>
                Leadership & Organizational
                <br />
                <em>
                  Recognition.
                </em>
              </h3>

            </div>


            <span className="leadership-index">
              04
            </span>

          </div>


          <div className="leadership-overview">

            <div className="leadership-info">

              <span className="leadership-organization">
                {leadership.organization}
              </span>


              <h4>
                {leadership.position}
              </h4>


              <span className="leadership-period">
                {leadership.period}
              </span>

            </div>


            <div className="leadership-description">

              <p>
                Leadership experience developed through
                progressive responsibilities in electrical
                engineering, technical coordination, and
                team management.
              </p>

            </div>

          </div>


          <div className="leadership-certificates">

            <div className="leadership-certificates-header">

              <span>
                CERTIFICATES OF APPRECIATION
              </span>


              <span>
                {String(
                  leadership.certificates.length
                ).padStart(2, "0")}{" "}
                DOCUMENTS
              </span>

            </div>


            <div className="leadership-certificate-grid">

              {leadership.certificates.map(
                (certificate, index) => (

                  <article
                    className="leadership-certificate-card"
                    key={index}
                  >

                    <button
                      type="button"
                      className="leadership-certificate-image"
                      onClick={() =>
                        onOpenCertificate(
                          certificate
                        )
                      }
                    >

                      <img
                        src={certificate.image}
                        alt={`${certificate.title} - ${certificate.role}`}
                      />


                      <span className="certificate-view">
                        VIEW ↗
                      </span>

                    </button>


                    <div className="leadership-certificate-meta">

                      <span>
                        {String(
                          index + 1
                        ).padStart(2, "0")}
                      </span>


                      <div>

                        <strong>
                          {certificate.title}
                        </strong>


                        <p>
                          {certificate.role}
                        </p>

                      </div>

                    </div>

                  </article>

                )
              )}

            </div>

          </div>

        </div>


        {/* =================================================
            FOOTER
        ================================================= */}

        <div className="awards-footer">

          <div className="awards-footer-label">
            ACHIEVEMENT PROFILE
          </div>


          <div className="leadership-content">

            <div className="leadership-info">

              <span className="leadership-organization">
                ENGINEERING • COMPETITION • LEADERSHIP
              </span>


              <strong>
                Technical Achievement & Team Leadership
              </strong>


              <span className="leadership-period">
                2021 — 2024
              </span>

            </div>

          </div>

        </div>


        <button
          type="button"
          className="page-next-button"
          onClick={() =>
            onNavigate("certifications")
          }
        >
          View Certifications →
        </button>

      </div>

    </section>
  );
}


/* =========================================================
   CERTIFICATIONS PAGE
========================================================= */

function CertificationsPage({
  onNavigate,
}) {

  return (
    <section className="certifications-page">

      <div className="section-container">

        {/* =================================================
            HEADER
        ================================================= */}

        <div className="section-heading">

          <span className="section-number">
            04
          </span>


          <div>

            <p className="section-label">
              CERTIFICATIONS
            </p>


            <h2>
              Professional
              <br />
              <span>
                Certifications & Credentials.
              </span>
            </h2>

          </div>

        </div>


        {/* =================================================
            INTRO
        ================================================= */}

        <div className="certifications-intro">

          <p>
            Professional certifications, training records,
            and technical credentials will be presented in
            this section.
          </p>

        </div>


        {/* =================================================
            EMPTY CERTIFICATION PANEL
        ================================================= */}

        <div className="certifications-panel">

          <div className="certifications-panel-header">

            <span>
              PROFESSIONAL CREDENTIALS
            </span>


            <span>
              00 DOCUMENTS
            </span>

          </div>


          <div className="certifications-empty">

            <div className="certifications-empty-number">
              04
            </div>


            <div className="certifications-empty-content">

              <span>
                CERTIFICATIONS
              </span>


              <h3>
                Credentials will be added here.
              </h3>


              <p>
                This section is intentionally prepared
                for professional certifications, technical
                training, competency certificates, and
                other relevant credentials.
              </p>

            </div>


            <div className="certifications-empty-status">
              COMING SOON
            </div>

          </div>

        </div>


        {/* =================================================
            CERTIFICATION CATEGORIES
        ================================================= */}

        <div className="certification-categories">

          <div className="certification-category">

            <span>
              01
            </span>

            <div>
              <strong>
                ENGINEERING
              </strong>

              <p>
                Engineering and technical certifications.
              </p>
            </div>

          </div>


          <div className="certification-category">

            <span>
              02
            </span>

            <div>
              <strong>
                SAFETY
              </strong>

              <p>
                Safety and site-related credentials.
              </p>
            </div>

          </div>


          <div className="certification-category">

            <span>
              03
            </span>

            <div>
              <strong>
                TECHNICAL TRAINING
              </strong>

              <p>
                Technical courses and competency training.
              </p>
            </div>

          </div>

        </div>


        {/* =================================================
            NEXT
        ================================================= */}

        <button
          type="button"
          className="page-next-button"
          onClick={() =>
            onNavigate("contact")
          }
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

          <span className="section-number">
            05
          </span>


          <div>

            <p className="section-label">
              CONTACT
            </p>


            <h2>
              Let's Build
              <br />
              <span>
                Something Meaningful.
              </span>
            </h2>

          </div>

        </div>


        <div className="contact-content">

          <div className="contact-message">

            <p>
              Interested in discussing engineering,
              project opportunities, technical work,
              or potential collaboration?
            </p>


            <a
              href="mailto:your@email.com"
              className="contact-email"
            >
              your@email.com ↗
            </a>

          </div>


          <div className="contact-details">

            <div>
              <span>
                LOCATION
              </span>

              <strong>
                Yogyakarta, Indonesia
              </strong>
            </div>


            <div>
              <span>
                FIELD
              </span>

              <strong>
                Electrical & Instrumentation
              </strong>
            </div>


            <div>
              <span>
                AVAILABILITY
              </span>

              <strong>
                Open to Opportunities
              </strong>
            </div>

          </div>

        </div>


        <button
          type="button"
          className="page-next-button"
          onClick={() =>
            onNavigate("home")
          }
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