import * as React from 'react'
import { Converter } from 'showdown'

type MarkdownProps = {
  className?: string
  content: string
}

const Markdown: React.SFC<MarkdownProps> = props => (
  <div
    className={props.className}
    dangerouslySetInnerHTML={{ __html: converter.makeHtml(props.content) }}
  />
)

const converter = new Converter()

export default Markdown
