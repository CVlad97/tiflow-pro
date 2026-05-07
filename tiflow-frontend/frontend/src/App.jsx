import React, { useState } from "react";

function Navbar({ current, onChange }) {
  const links = [
    { id: "home", label: "Accueil" },
    { id: "concept", label: "Concept" },
    { id: "projects", label: "Projets" },
    { id: "simulation", label: "Simulation" },
    { id: "transparency", label: "Transparence" },
    { id: "community", label: "Communauté" },
    { id: "faq", label: "FAQ" },
  ];

  const scrollTo = (id) => {
    onChange(id);
    const el = document.getElementById(id);
    if (el) el.scrollIntoView({ behavior: "smooth" });
  };

  return (
    <header className="navbar">
      <div className="navbar-brand">
        <span className="logo-dot" />
        <span className="logo-text">TiFlow</span>
      </div>
      <nav className="navbar-links">
        {links.map((l) => (
          <button
            key={l.id}
            className={
              "nav-link " + (current === l.id ? "nav-link-active" : "")
            }
            onClick={() => scrollTo(l.id)}
          >
            {l.label}
          </button>
        ))}
        <button
          className="btn-primary"
          onClick={() => scrollTo("projects")}
          style={{ marginLeft: "0.5rem" }}
        >
          Commencer
        </button>
      </nav>
    </header>
  );
}

function Hero() {
  const scrollToProjects = () => {
    const el = document.getElementById("projects");
    if (el) el.scrollIntoView({ behavior: "smooth" });
  };
  const scrollToCommunity = () => {
    const el = document.getElementById("community");
    if (el) el.scrollIntoView({ behavior: "smooth" });
  };

  return (
    <section className="hero" id="home">
      <div className="hero-left">
        <p className="hero-badge">Simulation pédagogique - aucun gain garanti</p>
        <h1>
          Comprends ce que tu{" "}
          <span className="accent">finances en simulation</span>
        </h1>
        <p className="hero-subtitle">
          Tu contribues, ça produit, tu gagnes… <strong>sur le papier</strong>.
          TiFlow te montre comment une contribution pourrait générer un flux
          productif, sans que la plateforme ne collecte ton argent ni ne
          promette un rendement réel.
        </p>
        <div className="hero-actions">
          <button className="btn-primary" onClick={scrollToProjects}>
            Commencer
          </button>
          <button className="btn-secondary" onClick={scrollToCommunity}>
            Rejoindre la communauté
          </button>
        </div>
        <div className="hero-stats">
          <div>
            <span className="hero-stat-number">0</span>
            <span className="hero-stat-label">Promesse de rendement</span>
          </div>
          <div>
            <span className="hero-stat-number">15</span>
            <span className="hero-stat-label">Projets simulés</span>
          </div>
          <div>
            <span className="hero-stat-number">100%</span>
            <span className="hero-stat-label">Simulation et transparence</span>
          </div>
        </div>
        <p className="hero-subtitle">
          Transforme tes contributions en scénarios de revenus productifs, grâce à un
          modèle transparent, simple et accessible.
        </p>
      </div>
      <div className="hero-right">
        <div className="hero-card">
          <p className="hero-badge">Exemple de projet du moment</p>
          <h2>Machine industrielle de découpe laser</h2>
          <p className="hero-card-text">
            Un projet à fort potentiel productif : une machine louée à une
            entreprise locale de fabrication, pour produire des pièces à forte valeur ajoutée.
          </p>
          <p className="hero-card-text">
            <strong>Coût total :</strong> 25 000 €
          </p>
          <p className="hero-card-text">
            <strong>Durée :</strong> 24 mois
          </p>
          <p className="hero-card-text">
            <strong>Contribution min. étudiée :</strong> 50 €
          </p>
          <p className="hero-card-highlight">
            Gain mensuel simulé : <strong>4,5 € / 50 €</strong>
          </p>
          <div className="progress-bar">
            <div
              className="progress-fill"
              style={{ width: "68%" }}
            />
          </div>
          <p className="hero-card-text">
            <strong>Progression simulée :</strong> 17 000 € “collectés” / 8 000 €
            restants.
          </p>
          <p className="hero-card-footnote">
            Cette machine serait louée à une entreprise locale. Les revenus de
            location pourraient être redistribués mensuellement aux
            contributeurs, proportionnellement à leur participation, dans un
            scénario théorique. TiFlow ne réalise pas cette opération : c’est un
            cas école.
          </p>
        </div>
      </div>
    </section>
  );
}

function Section({ id, title, subtitle, children }) {
  return (
    <section className="section" id={id}>
      <div className="section-header">
        <h2>{title}</h2>
        {subtitle && <p className="section-subtitle">{subtitle}</p>}
      </div>
      {children}
    </section>
  );
}

function ConceptSection() {
  return (
    <Section
      id="concept"
      title="Pourquoi TiFlow ?"
      subtitle="Un modèle simple, transparent et accessible à tous."
    >
      <div className="bd-grid">
        <div className="bd-card">
          <span className="bd-step">1</span>
          <h3>Le Problème</h3>
          <p>
            Les gens ne savent pas où investir simplement. Les solutions
            traditionnelles sont complexes, opaques et nécessitent des montants
            élevés.
          </p>
          <ul className="bd-list">
            <li>Investissement minimum trop élevé</li>
            <li>Processus compliqué et long</li>
            <li>Manque de transparence</li>
          </ul>
        </div>
        <div className="bd-card">
          <span className="bd-step">2</span>
          <h3>La Solution TiFlow</h3>
          <p>
            TiFlow transforme tes contributions en <strong>revenus productifs simulés</strong>.
            Tu comprends comment un projet peut générer un flux, sans passer par
            une plateforme régulée ou confier ton argent.
          </p>
          <ul className="bd-list">
            <li>Contributions étudiées dès 10 €</li>
            <li>Processus ultra-simple</li>
            <li>Transparence totale sur le scénario</li>
          </ul>
        </div>
        <div className="bd-card">
          <span className="bd-step">3</span>
          <h3>Tes Avantages</h3>
          <p>
            Profite d’un modèle qui te permet de générer des{" "}
            <strong>revenus périodiques simulés</strong> tout en gardant le
            contrôle.
          </p>
          <ul className="bd-list">
            <li>Revenus simulés mensuels</li>
            <li>Transparence complète</li>
            <li>Simplicité maximale</li>
          </ul>
        </div>
      </div>
    </Section>
  );
}

function ProjectsSection() {
  return (
    <Section
      id="projects"
      title="Projet du moment"
      subtitle="Un exemple concret pour visualiser un flux productif."
    >
      <div className="projects-grid">
        <div className="project-card">
          <div className="project-chip">Populaire</div>
          <h3>Machine industrielle de découpe laser</h3>
          <p className="project-desc">
            Une machine à fort potentiel productif, utilisée par une entreprise
            locale de fabrication pour des pièces sur mesure.
          </p>
          <div className="project-row">
            <span>Coût total : <strong>25 000 €</strong></span>
            <span>Durée : <strong>24 mois</strong></span>
          </div>
          <div className="project-row">
            <span>Contribution min. étudiée : <strong>50 €</strong></span>
            <span>Gain mensuel simulé : <strong>4,5 € / 50 €</strong></span>
          </div>
          <div className="progress-bar">
            <div className="progress-fill" style={{ width: "68%" }} />
          </div>
          <div className="project-row">
            <span>17 000 € “collectés”</span>
            <span>8 000 € restants</span>
          </div>
          <p className="project-desc">
            Dans ce scénario, la machine est louée à une entreprise locale. Les
            revenus de location seraient redistribués chaque mois aux
            contributeurs, proportionnellement à leur participation. TiFlow se
            contente de <strong>simuler</strong> ce mécanisme.
          </p>
          <div className="hero-actions" style={{ marginTop: "0.6rem" }}>
            <button className="btn-primary">Contribuer (en simulation)</button>
            <button className="btn-secondary">Simuler mes revenus</button>
          </div>
        </div>
      </div>
    </Section>
  );
}

function SimulationSection() {
  const [amount, setAmount] = useState(50);
  const monthly = ((amount / 50) * 4.5).toFixed(2);
  const total = (parseFloat(monthly) * 24).toFixed(2);

  return (
    <Section
      id="simulation"
      title="Simulation simple"
      subtitle="Un aperçu rapide de ce que pourrait donner un flux productif théorique."
    >
      <div className="simulator">
        <div className="simulator-left">
          <label className="sim-label">
            Montant étudié (10 à 5 000 €) :
            <input
              type="number"
              value={amount}
              min={10}
              max={5000}
              onChange={(e) =>
                setAmount(
                  Math.max(10, Math.min(5000, Number(e.target.value) || 10))
                )
              }
            />
          </label>
          <p className="sim-note">
            Ce simulateur ne touche jamais à ton argent réel. Il sert
            uniquement à visualiser un scénario possible, avec toutes ses
            limites.
          </p>
        </div>
        <div className="simulator-right">
          <div className="sim-card">
            <h3>Projection pédagogique</h3>
            <p>Projet : <strong>Machine de découpe laser</strong></p>
            <p>Durée : <strong>24 mois</strong></p>
            <p>Montant étudié : <strong>{amount.toLocaleString()} €</strong></p>
            <hr />
            <p>
              Flux théorique mensuel :{" "}
              <strong>{monthly} € / mois</strong>
            </p>
            <p>
              Flux cumulé sur la durée :{" "}
              <strong>{total} €</strong>
            </p>
            <p className="sim-disclaimer">
              ⚠️ Les chiffres affichés sont des hypothèses simplifiées, à titre
              indicatif uniquement. TiFlow ne garantit aucun rendement et ne
              propose pas d’investissement réel.
            </p>
          </div>
        </div>
      </div>
    </Section>
  );
}

function TransparencySection() {
  return (
    <Section
      id="transparency"
      title="Transparence"
      subtitle="Comprendre clairement ce que fait (et ne fait pas) TiFlow."
    >
      <div className="faq-grid">
        <div className="faq-card">
          <h3>Ce que fait TiFlow</h3>
          <p>
            TiFlow illustre comment des contributions pourraient générer des
            flux productifs à travers des scénarios pédagogiques : machines,
            micro-activités, équipements professionnels, etc.
          </p>
        </div>
        <div className="faq-card">
          <h3>Ce que TiFlow ne fait pas</h3>
          <p>
            TiFlow ne collecte pas d’argent, ne gère pas de portefeuille, ne
            propose pas de titres financiers, ne promet aucun rendement. Pour
            tout investissement réel, il faudra passer par des acteurs régulés.
          </p>
        </div>
        <div className="faq-card">
          <h3>Objectif</h3>
          <p>
            Aider chacun à comprendre les mécaniques d’un projet productif,
            avant d’éventuellement se tourner vers des partenaires régulés ou
            des solutions adaptées à sa situation.
          </p>
        </div>
      </div>
    </Section>
  );
}

function CommunitySection() {
  return (
    <Section
      id="community"
      title="Communauté TiFlow"
      subtitle="Rejoins la communauté pour recevoir les projets en avant-première."
    >
      <p className="section-subtitle">
        La communauté est le cœur de TiFlow : échanges, retours d’expérience,
        idées de projets, améliorations, et partage de ressources.
      </p>
      <div className="hero-actions">
        <a
          className="btn-primary"
          href="https://chat.whatsapp.com"
          target="_blank"
          rel="noreferrer"
        >
          Rejoindre sur WhatsApp
        </a>
        <a
          className="btn-secondary"
          href="https://t.me"
          target="_blank"
          rel="noreferrer"
        >
          Rejoindre sur Telegram
        </a>
      </div>
    </Section>
  );
}

function TestimonialsSection() {
  const testimonials = [
    {
      quote:
        "Enfin une solution simple pour faire fructifier ses économies… en simulation ! J’ai pu tester plusieurs projets sans risque et mieux comprendre les flux.",
      name: "Marie L.",
      role: "Membre depuis 8 mois",
    },
    {
      quote:
        "Le concept est génial. J’ai commencé avec 50 € sur le projet food truck (en scénario). La communauté est très active et on reçoit tous les updates.",
      name: "Thomas K.",
      role: "Membre depuis 5 mois",
    },
    {
      quote:
        "Pour une PME comme la nôtre, utiliser TiFlow pour expliquer notre projet, c’est parfait. Ça rend nos besoins clairs pour les partenaires.",
      name: "Sophie B.",
      role: "Entreprise partenaire",
    },
  ];

  return (
    <Section
      id="testimonials"
      title="Ils parlent de TiFlow"
      subtitle="L’avis de la communauté."
    >
      <div className="faq-grid">
        {testimonials.map((t, idx) => (
          <div key={idx} className="faq-card">
            <p>“{t.quote}”</p>
            <p style={{ marginTop: "0.4rem", fontWeight: 600 }}>{t.name}</p>
            <p className="footer-small">{t.role}</p>
          </div>
        ))}
      </div>
    </Section>
  );
}

function FAQSection() {
  const faqs = [
    {
      q: "TiFlow est-il une plateforme d’investissement ?",
      a: "Non. TiFlow est un simulateur pédagogique. Il ne collecte pas d’argent, ne vend pas de produits financiers et ne promet aucun rendement.",
    },
    {
      q: "Puis-je gagner de l’argent via TiFlow ?",
      a: "Pas directement. Tu peux utiliser TiFlow pour mieux comprendre les projets et ensuite, si tu le souhaites, te tourner vers des acteurs régulés pour des investissements réels.",
    },
    {
      q: "TiFlow me conseille-t-il personnellement ?",
      a: "Non. TiFlow ne fournit pas de conseil individualisé en investissement. Il aide à structurer, simuler et analyser des projets de façon générale.",
    },
    {
      q: "Les chiffres sont-ils fiables ?",
      a: "Ce sont des estimations simplifiées, avec beaucoup d’hypothèses. Ils servent à apprendre, pas à prendre une décision d’investissement directe.",
    },
  ];
  return (
    <Section
      id="faq"
      title="FAQ"
      subtitle="Quelques réponses aux questions fréquentes."
    >
      <div className="faq-grid">
        {faqs.map((f, idx) => (
          <div key={idx} className="faq-card">
            <h3>{f.q}</h3>
            <p>{f.a}</p>
          </div>
        ))}
      </div>
    </Section>
  );
}

function Footer() {
  return (
    <footer className="footer">
      <div className="footer-cols">
        <div>
          <h4>TiFlow</h4>
          <p className="footer-small">
            Investissement participatif simplifié… en simulation. Tu contribues,
            ça produit, tu gagnes (sur le papier), et tu comprends mieux comment
            fonctionne un projet productif.
          </p>
        </div>
        <div>
          <h4>Navigation</h4>
          <p className="footer-small">Accueil · Concept · Projets · Simulation</p>
        </div>
        <div>
          <h4>Communauté</h4>
          <p className="footer-small">
            WhatsApp · Telegram · Contact (prochainement)
          </p>
        </div>
      </div>
      <p className="footer-small" style={{ marginTop: "0.6rem" }}>
        © {new Date().getFullYear()} TiFlow. Tous droits réservés.
      </p>
      <p className="footer-small">
        Les gains mentionnés sont des simulations à titre indicatif uniquement.
        TiFlow ne garantit aucun rendement financier et ne fournit pas de
        services d’investissement régulés.
      </p>
    </footer>
  );
}

export default function App() {
  const [page, setPage] = useState("home");

  return (
    <div className="app">
      <Navbar current={page} onChange={setPage} />
      <Hero />
      <ConceptSection />
      <ProjectsSection />
      <SimulationSection />
      <TransparencySection />
      <CommunitySection />
      <TestimonialsSection />
      <FAQSection />
      <Footer />
    </div>
  );
}
