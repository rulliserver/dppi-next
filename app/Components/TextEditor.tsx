import sanitizeHtml from 'sanitize-html';

type Props = { data: string };

function TextEditor({ data }: Props) {
    const clean = sanitizeHtml(data, {
        allowedTags: ["p", "b", "i", "em", "strong", "a", "ul", "ol", "li", "br", "h1", "h2", "h3", "blockquote", "pre", "code", "img", "span"],
        allowedAttributes: {
            a: ["href", "name", "target", "rel"],
            img: ["src", "alt", "title", "width", "height"],
            span: ["class"],
        },
        allowProtocolRelative: false,
        transformTags: {
            a: sanitizeHtml.simpleTransform('a', { rel: 'noopener noreferrer nofollow' }),
        },
    });

    return <article className="richtext" dangerouslySetInnerHTML={{ __html: clean }} />;
}


export default TextEditor;
