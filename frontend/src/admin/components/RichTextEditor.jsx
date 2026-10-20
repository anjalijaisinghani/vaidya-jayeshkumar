import { useEffect, useRef, useState } from 'react'
import { EditorContent, useEditor, useEditorState } from '@tiptap/react'
import StarterKit from '@tiptap/starter-kit'
import Image from '@tiptap/extension-image'
import Placeholder from '@tiptap/extension-placeholder'
import { checkImageFile, IMAGE_ACCEPT } from '../lib/images.js'
import FormDialog from './FormDialog.jsx'

// The editor can only create what the website (and the server) accept: headings 2-4, paragraphs,
// bold, italic, underline, lists, quotes, links, images and a divider. Anything else that is
// pasted in (colours, strikethrough, code blocks...) is dropped, but its text is kept.
const extensions = [
  StarterKit.configure({
    heading: { levels: [2, 3, 4] },
    strike: false,
    code: false,
    codeBlock: false,
    trailingNode: false,
    link: { openOnClick: false, autolink: false, linkOnPaste: true },
  }),
  Image,
  Placeholder.configure({ placeholder: 'Write the article here...' }),
]

// "example.com" -> "https://example.com", "me@site.in" -> "mailto:me@site.in"
function normalizeUrl(raw) {
  const value = raw.trim()
  if (!value) return ''
  if (/^[a-z][a-z0-9+.-]*:/i.test(value)) return value
  if (/^\S+@\S+\.\S+$/.test(value)) return `mailto:${value}`
  return `https://${value}`
}

const isAllowedLink = (url) => /^(https?:\/\/\S+|mailto:\S+@\S+|tel:[+\d\s()-]+)$/i.test(url)

function ToolButton({ label, pressed, disabled, onClick, children }) {
  return (
    <button
      type="button"
      aria-label={label}
      aria-pressed={pressed}
      disabled={disabled}
      onClick={onClick}
      className={`rounded-lg px-3 py-1.5 text-sm font-medium transition-colors disabled:cursor-not-allowed disabled:opacity-40 ${
        pressed ? 'bg-leaf-800 text-white' : 'text-ink-700 hover:bg-leaf-50 hover:text-leaf-900'
      }`}
    >
      {children}
    </button>
  )
}

// initialHtml:   the text to start with (only read once)
// onReady(html, isEmpty):  called once, with the editor's own tidy version of initialHtml
// onChange(html, isEmpty): called after every edit
// onUploadImage(file):     uploads a picture and returns its web address
export default function RichTextEditor({ initialHtml, onReady, onChange, onUploadImage, labelId, describedBy, invalid = false }) {
  const [linkOpen, setLinkOpen] = useState(false)
  const [linkUrl, setLinkUrl] = useState('')
  const [linkError, setLinkError] = useState('')
  const [pendingImage, setPendingImage] = useState(null)
  const [altText, setAltText] = useState('')
  const [uploading, setUploading] = useState(false)
  const [message, setMessage] = useState(null) // { type: 'info' | 'error', text }
  const fileInput = useRef(null)

  const editor = useEditor({
    extensions,
    content: initialHtml,
    editorProps: {
      attributes: {
        class: 'article-content min-h-[18rem] px-4 py-3 focus:outline-none',
        role: 'textbox',
        'aria-multiline': 'true',
        'aria-labelledby': labelId,
        ...(describedBy ? { 'aria-describedby': describedBy } : {}),
      },
    },
    onUpdate: ({ editor: e }) => onChange(e.getHTML(), e.isEmpty),
  })

  // Tell the form once what the editor made of the starting text. Done here, after mounting,
  // so the form is never updated before it is ready to receive it.
  useEffect(() => {
    if (editor) onReady?.(editor.getHTML(), editor.isEmpty)
  }, [editor]) // eslint-disable-line react-hooks/exhaustive-deps

  const state = useEditorState({
    editor,
    selector: ({ editor: e }) =>
      e
        ? {
            block: e.isActive('heading', { level: 2 })
              ? 'h2'
              : e.isActive('heading', { level: 3 })
                ? 'h3'
                : e.isActive('heading', { level: 4 })
                  ? 'h4'
                  : 'p',
            bold: e.isActive('bold'),
            italic: e.isActive('italic'),
            underline: e.isActive('underline'),
            bulletList: e.isActive('bulletList'),
            orderedList: e.isActive('orderedList'),
            blockquote: e.isActive('blockquote'),
            link: e.isActive('link'),
            canUndo: e.can().undo(),
            canRedo: e.can().redo(),
          }
        : null,
  })

  if (!editor || !state) return <div className="skeleton h-72 w-full" aria-hidden="true" />

  const run = () => editor.chain().focus()

  function onBlockChange(event) {
    const value = event.target.value
    if (value === 'p') run().setParagraph().run()
    else run().setHeading({ level: Number(value.slice(1)) }).run()
  }

  function openLinkDialog() {
    if (editor.state.selection.empty && !editor.isActive('link')) {
      setMessage({ type: 'info', text: 'Select the words you want to turn into a link, then click Link.' })
      return
    }
    setMessage(null)
    setLinkUrl(editor.getAttributes('link').href || '')
    setLinkError('')
    setLinkOpen(true)
  }

  function submitLink() {
    const href = normalizeUrl(linkUrl)
    if (!href) {
      setLinkError('Enter a web address.')
      return
    }
    if (!isAllowedLink(href)) {
      setLinkError('Use a web address (https://...), an email address, or a phone number (tel:...).')
      return
    }
    run().extendMarkRange('link').setLink({ href }).run()
    setLinkOpen(false)
  }

  function removeLink() {
    run().extendMarkRange('link').unsetLink().run()
    setLinkOpen(false)
  }

  async function onFileChosen(event) {
    const file = event.target.files?.[0]
    event.target.value = ''
    if (!file) return
    const problem = checkImageFile(file)
    if (problem) {
      setMessage({ type: 'error', text: problem })
      return
    }
    setUploading(true)
    setMessage({ type: 'info', text: 'Uploading image...' })
    try {
      const url = await onUploadImage(file)
      setAltText('')
      setPendingImage({ url })
      setMessage(null)
    } catch (err) {
      setMessage(err.status === 401 ? null : { type: 'error', text: err.message })
    } finally {
      setUploading(false)
    }
  }

  function insertImage() {
    run().setImage({ src: pendingImage.url, alt: altText.trim() }).run()
    setPendingImage(null)
  }

  return (
    <div>
      <div
        className={`overflow-hidden rounded-lg border bg-white focus-within:ring-2 ${
          invalid
            ? 'border-red-600 focus-within:ring-red-200'
            : 'border-cream-300 focus-within:border-leaf-600 focus-within:ring-leaf-300'
        }`}
      >
        <div role="toolbar" aria-label="Text formatting" className="flex flex-wrap items-center gap-1 border-b border-cream-300 bg-cream-50 p-2">
          <select
            aria-label="Text style"
            value={state.block}
            onChange={onBlockChange}
            className="rounded-lg border border-cream-300 bg-white px-2 py-1.5 text-sm text-ink-900"
          >
            <option value="p">Normal text</option>
            <option value="h2">Heading</option>
            <option value="h3">Sub-heading</option>
            <option value="h4">Small heading</option>
          </select>
          <ToolButton label="Bold" pressed={state.bold} onClick={() => run().toggleBold().run()}>
            <span className="font-bold">B</span>
          </ToolButton>
          <ToolButton label="Italic" pressed={state.italic} onClick={() => run().toggleItalic().run()}>
            <span className="italic">I</span>
          </ToolButton>
          <ToolButton label="Underline" pressed={state.underline} onClick={() => run().toggleUnderline().run()}>
            <span className="underline">U</span>
          </ToolButton>
          <ToolButton label="Bullets" pressed={state.bulletList} onClick={() => run().toggleBulletList().run()}>
            Bullets
          </ToolButton>
          <ToolButton label="Numbers" pressed={state.orderedList} onClick={() => run().toggleOrderedList().run()}>
            Numbers
          </ToolButton>
          <ToolButton label="Quote" pressed={state.blockquote} onClick={() => run().toggleBlockquote().run()}>
            Quote
          </ToolButton>
          <ToolButton label="Link" pressed={state.link} onClick={openLinkDialog}>
            Link
          </ToolButton>
          <ToolButton label="Image" disabled={uploading} onClick={() => fileInput.current?.click()}>
            Image
          </ToolButton>
          <ToolButton label="Divider" onClick={() => run().setHorizontalRule().run()}>
            Divider
          </ToolButton>
          <ToolButton label="Undo" disabled={!state.canUndo} onClick={() => run().undo().run()}>
            Undo
          </ToolButton>
          <ToolButton label="Redo" disabled={!state.canRedo} onClick={() => run().redo().run()}>
            Redo
          </ToolButton>
        </div>
        <EditorContent editor={editor} />
      </div>

      <input
        ref={fileInput}
        type="file"
        accept={IMAGE_ACCEPT}
        className="hidden"
        aria-label="Choose an image to insert"
        tabIndex={-1}
        onChange={onFileChosen}
      />

      <div aria-live="polite">
        {message && (
          <p
            className={`alert mt-3 ${message.type === 'error' ? 'alert-error' : 'alert-info'}`}
            role={message.type === 'error' ? 'alert' : 'status'}
          >
            {message.text}
          </p>
        )}
      </div>

      <FormDialog
        open={linkOpen}
        title="Add a link"
        submitLabel={state.link ? 'Update link' : 'Add link'}
        error={linkError}
        onSubmit={submitLink}
        onCancel={() => setLinkOpen(false)}
        extraAction={
          state.link ? (
            <button type="button" className="btn btn-secondary mr-auto" onClick={removeLink}>
              Remove link
            </button>
          ) : null
        }
      >
        <div>
          <label htmlFor="link-url" className="field-label">Web address</label>
          <input
            id="link-url"
            type="text"
            inputMode="url"
            autoComplete="off"
            value={linkUrl}
            onChange={(event) => setLinkUrl(event.target.value)}
            placeholder="https://example.com"
            className="field-input"
          />
        </div>
      </FormDialog>

      <FormDialog
        open={Boolean(pendingImage)}
        title="Describe the image"
        submitLabel="Insert image"
        onSubmit={insertImage}
        onCancel={() => setPendingImage(null)}
      >
        {pendingImage && (
          <img src={pendingImage.url} alt="" className="max-h-48 w-full rounded-lg object-contain" />
        )}
        <div>
          <label htmlFor="image-alt" className="field-label">Short description of the picture</label>
          <input
            id="image-alt"
            type="text"
            maxLength={200}
            autoComplete="off"
            value={altText}
            onChange={(event) => setAltText(event.target.value)}
            className="field-input"
          />
          <p className="field-hint">
            Read aloud to visitors who cannot see the picture. Leave it empty only if the picture is purely decorative.
          </p>
        </div>
      </FormDialog>
    </div>
  )
}