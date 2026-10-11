// Rendering for an idea's submitted answers and its AI report.
// Shared by the founder's own detail page and the public marketplace page,
// which show identical content and differ only in the actions around it.

/** The founder's own answers, in the order the form asked for them. */
const SUBMITTED_FIELDS = [
  ["idea", "The idea"],
  ["problem", "Problem"],
  ["solution", "Solution"],
  ["target_customer", "Target customer"],
  ["differentiator", "What makes it different"],
  ["competitors", "Competitors"],
];

/** Report sections, grouped the way a reader would work through them. */
const REPORT_SECTIONS = [
  {
    heading: "The opportunity",
    fields: [
      ["executive_summary", "Executive summary"],
      ["problem_validation", "Problem validation"],
      ["solution_evaluation", "Solution evaluation"],
    ],
  },
  {
    heading: "Customers and market",
    fields: [
      ["target_customer_analysis", "Target customer analysis"],
      ["customer_segments", "Customer segments"],
      ["market_trends", "Market trends"],
    ],
  },
  {
    heading: "Competition",
    fields: [
      ["competitor_analysis", "Competitor analysis"],
      ["competitive_advantage", "Competitive advantage"],
    ],
  },
  {
    heading: "Business and money",
    fields: [
      ["business_model_analysis", "Business model analysis"],
      ["revenue_potential", "Revenue potential"],
      ["funding_recommendation", "Funding recommendation"],
    ],
  },
  {
    heading: "Getting to market",
    fields: [
      ["go_to_market_strategy", "Go-to-market strategy"],
      ["risk_analysis", "Risks"],
      ["recommendations", "Recommendations"],
    ],
  },
];

export function scoreTone(score) {
  if (score >= 75) return "text-emerald-600 dark:text-emerald-400";
  if (score >= 50) return "text-amber-600 dark:text-amber-400";
  return "text-rose-600 dark:text-rose-400";
}

export function Field({ label, value }) {
  if (!value) return null;
  return (
    <div>
      <p className="text-xs font-semibold uppercase tracking-wider text-slate-400">
        {label}
      </p>
      <p className="mt-1.5 whitespace-pre-line text-sm leading-6 text-slate-700 dark:text-slate-300">
        {value}
      </p>
    </div>
  );
}

export function Card({ title, subtitle, children }) {
  return (
    <section className="rounded-2xl border border-slate-200 bg-white p-6 dark:border-slate-800 dark:bg-slate-900">
      <h2 className="font-bold">{title}</h2>
      {subtitle && (
        <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">{subtitle}</p>
      )}
      <div className="mt-5 space-y-5">{children}</div>
    </section>
  );
}

export function SubmittedDetails({ idea, title = "What you submitted", subtitle }) {
  return (
    <Card title={title} subtitle={subtitle}>
      {SUBMITTED_FIELDS.map(([field, label]) => (
        <Field key={field} label={label} value={idea[field]} />
      ))}
    </Card>
  );
}

/** Empty sections are dropped, so a partial report isn't a column of blank headings. */
export function ReportSections({ report }) {
  return REPORT_SECTIONS.map(({ heading, fields }) => {
    const populated = fields.filter(([field]) => report[field]);
    if (populated.length === 0) return null;

    return (
      <Card key={heading} title={heading}>
        {populated.map(([field, label]) => (
          <Field key={field} label={label} value={report[field]} />
        ))}
      </Card>
    );
  });
}

export function ScoreCard({ score }) {
  return (
    <div className="rounded-2xl border border-slate-200 bg-white p-6 text-center dark:border-slate-800 dark:bg-slate-900">
      <p className="text-xs font-semibold uppercase tracking-wider text-slate-400">
        AI validation score
      </p>
      {typeof score === "number" ? (
        <>
          <p className={`mt-3 text-5xl font-bold ${scoreTone(score)}`}>
            {Math.round(score)}
            <span className="text-xl font-medium text-slate-400">/100</span>
          </p>
          <div className="mt-4 h-2 overflow-hidden rounded-full bg-slate-100 dark:bg-slate-800">
            <div
              className="h-full rounded-full bg-indigo-600 transition-all duration-700"
              style={{ width: `${Math.min(Math.max(score, 0), 100)}%` }}
            />
          </div>
          <p className="mt-3 text-xs leading-5 text-slate-400">
            Decision support, not a guarantee — weigh it with your own research.
          </p>
        </>
      ) : (
        <p className="mt-3 text-4xl font-bold text-slate-300 dark:text-slate-700">—</p>
      )}
    </div>
  );
}

export function MarketSizeCard({ market }) {
  if (!market || (!market.tam && !market.sam && !market.som)) return null;

  return (
    <div className="rounded-2xl border border-slate-200 bg-white p-6 dark:border-slate-800 dark:bg-slate-900">
      <h2 className="font-bold">Market size</h2>
      <dl className="mt-4 space-y-4">
        {[
          ["TAM", "Total addressable", market.tam],
          ["SAM", "Serviceable addressable", market.sam],
          ["SOM", "Serviceable obtainable", market.som],
        ].map(([abbr, full, value]) =>
          value ? (
            <div key={abbr}>
              <dt className="text-xs font-semibold uppercase tracking-wider text-indigo-600">
                {abbr}{" "}
                <span className="font-normal normal-case tracking-normal text-slate-400">
                  {full}
                </span>
              </dt>
              <dd className="mt-1 text-sm leading-6 text-slate-700 dark:text-slate-300">
                {value}
              </dd>
            </div>
          ) : null
        )}
      </dl>
    </div>
  );
}
