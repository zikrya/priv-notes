const AudioRender = ({ block, contentState }) => {
    const entity = contentState.getEntity(block.getEntityAt(0));
    const { src } = entity.getData();
    return <audio controls src={src} style={{ width: '50%' }} />;
};

export default AudioRender;
