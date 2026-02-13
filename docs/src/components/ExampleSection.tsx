import * as React from 'react'

interface ExampleSectionProps {
  title: string
  description?: string
  source?: string
  children: React.ReactNode
}

export default function ExampleSection({ title, description, source, children }: ExampleSectionProps) {
  const [showSource, setShowSource] = React.useState(false)

  return (
    <div className="example-section">
      <h3 className="example-title">{title}</h3>
      {description && <p className="example-description">{description}</p>}
      <div className="example-render">
        {children}
      </div>
      {source && (
        <>
          <button
            className="ui basic button"
            onClick={() => setShowSource(!showSource)}
          >
            {showSource ? 'Hide Code' : 'Show Code'}
          </button>
          {showSource && (
            <pre className="example-source">
              <code>{source}</code>
            </pre>
          )}
        </>
      )}
    </div>
  )
}
