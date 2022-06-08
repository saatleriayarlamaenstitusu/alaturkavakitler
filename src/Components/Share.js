function Share({ label, text, title }) {
    const canonical = document.querySelector("link[rel=canonical]");
    let url = canonical ? canonical.href : document.location.href;
    const shareDetails = { url, title, text };
  
    const handleSharing = async () => {
      if (navigator.share) {
        try {
          await navigator
            .share(shareDetails)
            .then(() =>
              console.log("Hooray! Your content was shared to tha world")
            );
        } catch (error) {
          console.log(`Oops! I couldn't share to the world because: ${error}`);
        }
      } else {
        // fallback code
        console.log(
          "Web share is currently not supported on this browser. Please provide a callback"
        );
      }
    };
    return (
      <button className="sharer-button " onClick={handleSharing}>
      <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" fill="currentColor" class="bi bi-share-fill" viewBox="0 0 16 16">
  <path d="M11 2.5a2.5 2.5 0 1 1 .603 1.628l-6.718 3.12a2.499 2.499 0 0 1 0 1.504l6.718 3.12a2.5 2.5 0 1 1-.488.876l-6.718-3.12a2.5 2.5 0 1 1 0-3.256l6.718-3.12A2.5 2.5 0 0 1 11 2.5z"/>
</svg>
        <span className="sharer-button-text">{label}</span>
      </button>
    );
  }

  export default Share;