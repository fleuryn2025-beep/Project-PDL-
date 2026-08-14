import { useState, useEffect } from "react";
import "./App.css";

function App() {
  /* =================================================
     AWARDS DATA
  ================================================= */

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

  /* =================================================
     LEADERSHIP DATA
  ================================================= */

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

  /* =================================================
     AWARD STATE
  ================================================= */

  const [selectedAward, setSelectedAward] = useState(awards[0]);

  /* =================================================
     LIGHTBOX STATE

     PENTING:
     lightboxImage dipisahkan dari selectedAward
     agar sertifikat Leadership tidak mengubah
     gambar pada bagian Awards.
  ================================================= */

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

  /* =================================================
     RESET IMAGE
  ================================================= */

  const resetImage = () => {
    setImageZoom(1);

    setImagePosition({
      x: 0,
      y: 0,
    });
  };

  /* =================================================
     OPEN AWARD IMAGE
  ================================================= */

  const openImage = () => {
    setLightboxImage(selectedAward.image);

    setLightboxTitle(selectedAward.title);

    resetImage();

    setIsImageOpen(true);
  };

  /* =================================================
     OPEN LEADERSHIP CERTIFICATE
  ================================================= */

  const openLeadershipCertificate = (certificate) => {
    setLightboxImage(certificate.image);

    setLightboxTitle(certificate.title);

    resetImage();

    setIsImageOpen(true);
  };

  /* =================================================
     CLOSE IMAGE
  ================================================= */

  const closeImage = () => {
    setIsImageOpen(false);

    setLightboxImage(null);

    setLightboxTitle("");

    resetImage();
  };

  /* =================================================
     CHANGE AWARD
  ================================================= */

  const handleAwardChange = (award) => {
    setSelectedAward(award);

    setIsImageOpen(false);

    setLightboxImage(null);

    setLightboxTitle("");

    resetImage();
  };

  /* =================================================
     ZOOM IN
  ================================================= */

  const zoomIn = () => {
    setImageZoom((currentZoom) =>
      Math.min(4, currentZoom + 0.25)
    );
  };

  /* =================================================
     ZOOM OUT
  ================================================= */

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

  /* =================================================
     MOUSE WHEEL ZOOM
  ================================================= */

  const handleWheelZoom = (e) => {
    e.preventDefault();

    if (e.deltaY < 0) {
      setImageZoom((currentZoom) =>
        Math.min(4, currentZoom + 0.15)
      );
    } else {
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
    }
  };

  /* =================================================
     START DRAG
  ================================================= */

  const handleMouseDown = (e) => {
    if (imageZoom <= 1) return;

    e.preventDefault();

    setIsDragging(true);

    setDragStart({
      x: e.clientX - imagePosition.x,
      y: e.clientY - imagePosition.y,
    });
  };

  /* =================================================
     DRAG IMAGE
  ================================================= */

  const handleMouseMove = (e) => {
    if (!isDragging) return;

    setImagePosition({
      x: e.clientX - dragStart.x,
      y: e.clientY - dragStart.y,
    });
  };

  /* =================================================
     STOP DRAG
  ================================================= */

  const handleMouseUp = () => {
    setIsDragging(false);
  };

  /* =================================================
     ESC KEY TO CLOSE
  ================================================= */

  useEffect(() => {
    const handleEscape = (e) => {
      if (e.key === "Escape") {
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

  /* =================================================
     LOCK BODY SCROLL WHEN LIGHTBOX OPEN
  ================================================= */

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

  return (
    <div className="portfolio">

      {/* =================================================
          NAVBAR
      ================================================= */}

      <header className="navbar">

        <div className="nav-container">

          <div className="logo">
            ISNAINI ADI SANTOSO
          </div>

          <nav className="nav-menu">

            <a href="#home">
              Home
            </a>

            <a href="#about">
              About
            </a>

            <a href="#experience">
              Experience
            </a>

            <a href="#awards">
              Awards
            </a>

            <a href="#certificates">
              Certificates
            </a>

            <a href="#contact">
              Contact
            </a>

          </nav>

          <button className="resume-button">
            Resume ↗
          </button>

        </div>

      </header>


      {/* =================================================
          HERO
      ================================================= */}

      <main id="home">

        <section className="hero">

          <div className="hero-container">

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
                Electrical Engineering professional with experience in
                project engineering, electrical systems, instrumentation,
                maintenance, and technical project coordination.
              </p>

              <div className="hero-buttons">

                <a
                  href="#projects"
                  className="primary-button"
                >
                  Explore My Work
                  <span>↗</span>
                </a>

                <a
                  href="#contact"
                  className="secondary-button"
                >
                  Let's Connect
                </a>

              </div>

              <div className="hero-stats">

                <div className="stat">
                  <strong>
                    02+
                  </strong>

                  <span>
                    Years Experience
                  </span>
                </div>

                <div className="stat">
                  <strong>
                    10+
                  </strong>

                  <span>
                    Projects
                  </span>
                </div>

                <div className="stat">
                  <strong>
                    03+
                  </strong>

                  <span>
                    Industries
                  </span>
                </div>

              </div>

            </div>


            <div className="hero-visual">

              <div className="visual-grid"></div>

              <div className="engineer-card">

                <div className="card-top">
                  <span>
                    ENGINEERING
                  </span>

                  <span>
                    01
                  </span>
                </div>

                <div className="engineer-symbol">
                  ⚡
                </div>

                <div className="card-bottom">

                  <span>
                    ELECTRICAL
                  </span>

                  <span>
                    PROJECTS
                  </span>

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


        {/* =================================================
            ABOUT
        ================================================= */}

        <section
          className="about-section"
          id="about"
        >

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
                  I am an Electrical & Instrumentation Engineer with
                  experience across engineering, EPC Oil & Gas,
                  power generation, manufacturing, and electrical
                  project execution.
                </p>

                <p className="about-text">
                  My experience covers electrical systems,
                  instrumentation, industrial automation,
                  maintenance, installation, inspection,
                  testing, commissioning, and technical
                  project coordination.
                </p>

                <p className="about-text">
                  I enjoy working between engineering and field
                  execution — translating technical requirements
                  into practical solutions while coordinating
                  with project teams, vendors, subcontractors,
                  and site personnel.
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
                <span>
                  BASED IN
                </span>

                <strong>
                  Yogyakarta, Indonesia
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

              <div>
                <span>
                  ENGINEERING
                </span>

                <strong>
                  Electrical • Instrumentation • Projects
                </strong>
              </div>

            </div>

          </div>

        </section>


        {/* =================================================
            EXPERIENCE
        ================================================= */}

        <section
          className="experience-section"
          id="experience"
        >

          <div className="section-container">

            <div className="section-heading experience-heading">

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
                installation, testing, commissioning,
                and site engineering.
              </p>

            </div>


            <div className="experience-timeline">


              {/* EXPERIENCE 01 */}

              <article className="experience-item featured">

                <div className="experience-marker">
                  <span>
                    01
                  </span>
                </div>

                <div className="experience-content">

                  <div className="experience-meta">

                    <span>
                      APR 2025 — MAR 2026
                    </span>

                    <span>
                      MINAS, RIAU
                    </span>

                  </div>

                  <h3>
                    Electrical & Instrumentation
                    <br />
                    Project Engineer
                  </h3>

                  <h4>
                    PT Geoservices — KSO UGDT
                  </h4>

                  <p className="experience-location">
                    Pertamina Hulu Rokan
                  </p>

                  <p className="experience-description">
                    Supported Electrical & Instrumentation
                    engineering activities throughout project
                    execution, including technical coordination,
                    field verification, inspection, testing,
                    commissioning, and technical documentation.
                  </p>

                  <div className="experience-tags">

                    <span>
                      E&I Engineering
                    </span>

                    <span>
                      Project Coordination
                    </span>

                    <span>
                      Field Inspection
                    </span>

                    <span>
                      Testing & Commissioning
                    </span>

                    <span>
                      Vendor Coordination
                    </span>

                  </div>

                  <div className="experience-achievement">

                    <span className="achievement-label">
                      KEY ACHIEVEMENTS
                    </span>

                    <ul>

                      <li>
                        Supported execution of Electrical &
                        Instrumentation activities for the
                        CEOR A / Surfactant project.
                      </li>

                      <li>
                        Successfully coordinated 3 subcontractors
                        during Electrical & Instrumentation
                        project execution.
                      </li>

                      <li>
                        Contributed to project execution through
                        field verification, coordination,
                        and commissioning support.
                      </li>

                    </ul>

                  </div>

                </div>

              </article>


              {/* EXPERIENCE 02 */}

              <article className="experience-item">

                <div className="experience-marker">
                  <span>
                    02
                  </span>
                </div>

                <div className="experience-content">

                  <div className="experience-meta">

                    <span>
                      JAN 2025 — APR 2025
                    </span>

                    <span>
                      YOGYAKARTA
                    </span>

                  </div>

                  <h3>
                    Engineering
                  </h3>

                  <h4>
                    PT Sinergi Integra Service
                  </h4>

                  <p className="experience-description">
                    Performed electrical Preventive Maintenance
                    and Corrective Maintenance while supervising
                    vendors and subcontractors during maintenance
                    and technical activities.
                  </p>

                  <div className="experience-tags">

                    <span>
                      Preventive Maintenance
                    </span>

                    <span>
                      Corrective Maintenance
                    </span>

                    <span>
                      Electrical Troubleshooting
                    </span>

                    <span>
                      Vendor Supervision
                    </span>

                  </div>

                  <div className="experience-achievement">

                    <span className="achievement-label">
                      KEY ACHIEVEMENTS
                    </span>

                    <ul>

                      <li>
                        Successfully supervised and coordinated
                        vendor activities during electrical
                        maintenance work.
                      </li>

                      <li>
                        Supported PM and CM activities to
                        maintain electrical equipment reliability.
                      </li>

                    </ul>

                  </div>

                </div>

              </article>


              {/* EXPERIENCE 03 */}

              <article className="experience-item">

                <div className="experience-marker">
                  <span>
                    03
                  </span>
                </div>

                <div className="experience-content">

                  <div className="experience-meta">

                    <span>
                      JAN 2024 — FEB 2025
                    </span>

                    <span>
                      PROBOLINGGO
                    </span>

                  </div>

                  <h3>
                    Electrical Engineering Intern
                  </h3>

                  <h4>
                    PT YTL Jawa Timur
                  </h4>

                  <p className="experience-location">
                    PLTU Paiton Units 5 & 6
                  </p>

                  <p className="experience-description">
                    Supported electrical system maintenance,
                    inspection, testing, troubleshooting,
                    and field activities within a power
                    generation environment.
                  </p>

                  <div className="experience-tags">

                    <span>
                      Power Generation
                    </span>

                    <span>
                      Electrical Maintenance
                    </span>

                    <span>
                      Inspection & Testing
                    </span>

                    <span>
                      Troubleshooting
                    </span>

                  </div>

                  <div className="experience-achievement">

                    <span className="achievement-label">
                      KEY ACHIEVEMENT
                    </span>

                    <ul>

                      <li>
                        Gained practical experience in electrical
                        maintenance supporting reliability and
                        operation of power generation systems.
                      </li>

                    </ul>

                  </div>

                </div>

              </article>


              {/* EXPERIENCE 04 */}

              <article className="experience-item">

                <div className="experience-marker">
                  <span>
                    04
                  </span>
                </div>

                <div className="experience-content">

                  <div className="experience-meta">

                    <span>
                      2021 — 2022
                    </span>

                    <span>
                      YOGYAKARTA
                    </span>

                  </div>

                  <h3>
                    Electrical Technician
                  </h3>

                  <h4>
                    CV Bintoro
                  </h4>

                  <p className="experience-description">
                    Performed Preventive Maintenance and
                    Corrective Maintenance, electrical inspection,
                    testing, measurement, troubleshooting,
                    installation, and repair activities.
                  </p>

                  <div className="experience-tags">

                    <span>
                      Electrical Maintenance
                    </span>

                    <span>
                      PM & CM
                    </span>

                    <span>
                      Electrical Testing
                    </span>

                    <span>
                      Troubleshooting
                    </span>

                  </div>

                  <div className="experience-achievement">

                    <span className="achievement-label">
                      KEY ACHIEVEMENT
                    </span>

                    <ul>

                      <li>
                        Supported PM and CM activities to
                        maintain electrical equipment reliability.
                      </li>

                    </ul>

                  </div>

                </div>

              </article>


              {/* EXPERIENCE 05 */}

              <article className="experience-item">

                <div className="experience-marker">
                  <span>
                    05
                  </span>
                </div>

                <div className="experience-content">

                  <div className="experience-meta">

                    <span>
                      AUG 2020 — JUL 2021
                    </span>

                    <span>
                      SOUTH TANGERANG
                    </span>

                  </div>

                  <h3>
                    Electrical Technician
                    <br />
                    & Site Engineer
                  </h3>

                  <h4>
                    PT Sinar Tekindo Mandiri
                  </h4>

                  <p className="experience-description">
                    Performed electrical panel assembly and wiring,
                    site inspections, electrical installation,
                    testing, commissioning, generator commissioning,
                    and synchronization activities.
                  </p>

                  <div className="experience-tags">

                    <span>
                      Panel Assembly
                    </span>

                    <span>
                      Electrical Installation
                    </span>

                    <span>
                      Generator
                    </span>

                    <span>
                      Commissioning
                    </span>

                    <span>
                      Site Engineering
                    </span>

                  </div>

                  <div className="experience-achievement">

                    <span className="achievement-label">
                      KEY PROJECT EXPERIENCE
                    </span>

                    <ul>

                      <li>
                        Electrical system installation and testing
                        at Embarcadero Park, Cilandak.
                      </li>

                      <li>
                        Electrical system installation and testing
                        at The Holland Village, Cempaka Putih, Jakarta.
                      </li>

                      <li>
                        Participated in large-scale generator
                        commissioning and synchronization at an
                        apartment project in Karawaci.
                      </li>

                    </ul>

                  </div>

                </div>

              </article>

            </div>


            {/* EXPERIENCE SUMMARY */}

            <div className="experience-summary">

              <div className="summary-item">
                <strong>
                  05
                </strong>

                <span>
                  Professional Roles
                </span>
              </div>

              <div className="summary-item">
                <strong>
                  E&I
                </strong>

                <span>
                  Primary Engineering Focus
                </span>
              </div>

              <div className="summary-item">
                <strong>
                  EPC
                </strong>

                <span>
                  Project Environment
                </span>
              </div>

              <div className="summary-item">
                <strong>
                  FIELD
                </strong>

                <span>
                  Execution Experience
                </span>
              </div>

            </div>

          </div>

        </section>


        {/* =================================================
            AWARDS
        ================================================= */}

        <section
          className="awards-section"
          id="awards"
        >

          <div className="awards-container">

            {/* HEADER */}

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
                  competitions, teamwork, and technical activities.
                </p>

              </div>

            </div>


            {/* =================================================
                AWARDS CONTENT
            ================================================= */}

            <div className="awards-interactive">

              {/* LEFT — AWARD LIST */}

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
                      handleAwardChange(award)
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


              {/* RIGHT — AWARD DETAIL */}

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


                  <div
                    className="evidence-image"
                    onClick={openImage}
                  >

                    <img
                      src={selectedAward.image}
                      alt={selectedAward.title}
                    />

                  </div>

                </div>


                {/* =================================================
                    CERTIFICATE
                ================================================= */}

                <div className="award-certificate">

                  <div>

                    <span>
                      CERTIFICATE
                    </span>

                    <p>
                      Official certificate will be displayed here.
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

            <div className="awards-footer">

              {/* LEFT */}

              <div className="awards-footer-label">
                LEADERSHIP
              </div>


              {/* RIGHT */}

              <div className="leadership-content">

                {/* INFORMATION */}

                <div className="leadership-info">

                  <span className="leadership-organization">
                    {leadership.organization}
                  </span>

                  <strong>
                    {leadership.position}
                  </strong>

                  <span className="leadership-period">
                    {leadership.period}
                  </span>

                </div>


                {/* CERTIFICATES */}

                <div className="leadership-certificates">

                  <div className="leadership-certificates-header">

                    <span>
                      CERTIFICATES
                    </span>

                    <span>
                      03 DOCUMENTS
                    </span>

                  </div>


                  <div className="leadership-certificate-grid">

                    {leadership.certificates.map(
                      (certificate, index) => (

                        <div
                          className="leadership-certificate"
                          key={index}
                        >

                          <div
                            className="leadership-certificate-image"
                            onClick={() =>
                              openLeadershipCertificate(
                                certificate
                              )
                            }
                          >

                            <img
                              src={certificate.image}
                              alt={certificate.title}
                            />

                          </div>


                          <div className="leadership-certificate-meta">

                            <span>
                              {certificate.title}
                            </span>

                            <p>
                              {certificate.role}
                            </p>

                          </div>

                        </div>

                      )
                    )}

                  </div>

                </div>

              </div>

            </div>

          </div>

        </section>


        {/* =================================================
            IMAGE LIGHTBOX
        ================================================= */}

        {isImageOpen && lightboxImage && (

          <div
            className="image-lightbox"
            onClick={closeImage}
          >

            {/* CLOSE */}

            <button
              type="button"
              className="lightbox-close"
              onClick={(e) => {
                e.stopPropagation();
                closeImage();
              }}
              aria-label="Close image"
            >
              ×
            </button>


            {/* CONTENT */}

            <div
              className="lightbox-content"
              onClick={(e) =>
                e.stopPropagation()
              }
            >

              {/* CONTROLS */}

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
                  )}%
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


              {/* IMAGE AREA */}

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

      </main>

    </div>
  );
}

export default App;