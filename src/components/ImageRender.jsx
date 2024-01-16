const ImageRender = ({ block, contentState }) => {
    const entity = contentState.getEntity(block.getEntityAt(0));
    const { src } = entity.getData();

    return <img src={src} alt="" style={{ width: '50%' }} />;
  };

  export default ImageRender;