import {FaCaretSquareDown, FaCaretSquareUp, FaCompressAlt, FaExpandAlt} from 'react-icons/all'

export function Switch(
    {
        hiding: [hiding, setHiding],
        overlaying: [overlaying, setOverlaying] = [true, () => console.log('No setOverlaying')]
    }) {
    return <section className="field is-grouped">
        <p className="control">
            <button onClick={() => setHiding(!hiding)} className="button">
                现金流图{hiding ? <FaCaretSquareDown/> : <FaCaretSquareUp/>}
            </button>
        </p>
        <p className="control" hidden={hiding}>
            <button onClick={() => setOverlaying(!overlaying)} className="button">
                支出{overlaying ? '收入分离' : '叠加到收入'}
                {overlaying ? <FaExpandAlt/> : <FaCompressAlt/>}
            </button>
        </p>
    </section>
}
