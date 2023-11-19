document.addEventListener('DOMContentLoaded', function () {
    const storiesContainer = document.getElementById('stories');
    const moreButton = document.getElementById('moreButton');
    let displayedStoryCount = 10;
    const storiesPerPage = 10;
    let topStoryIds = [];

    function formatTimestamp(timestamp) {
        const date = new Date(timestamp * 1000);
        const options = { year: 'numeric', month: 'numeric', day: 'numeric', hour: 'numeric', minute: 'numeric', second: 'numeric', timeZoneName: 'short' };
        return date.toLocaleString('en-US', options);
    }

    function loadMoreStories() {
        console.log('Loading more stories...');

        fetch('https://hacker-news.firebaseio.com/v0/topstories.json')
            .then(response => response.json())
            .then(data => {
                topStoryIds = data;

                const storyPromises = topStoryIds.slice(displayedStoryCount, displayedStoryCount + storiesPerPage).map(storyId =>
                    fetch(`https://hacker-news.firebaseio.com/v0/item/${storyId}.json`)
                        .then(response => response.json())
                );

                return Promise.all(storyPromises);
            })
            .then(topStories => {
                console.log('Top stories length:', topStories.length);

                topStories.forEach(story => {
                    console.log('Adding story:', story.title);

                    const storyBox = document.createElement('div');
                    storyBox.classList.add('story-box');

                    const title = document.createElement('h3');
                    title.innerText = story.title;

                    const time = document.createElement('p');
                    time.innerText = `Published on: ${formatTimestamp(story.time)}`;

                    const link = document.createElement('p');
                    link.classList.add('story-link');
                    link.innerText = `${story.url}`;

                    const urlButton = document.createElement('button');
                    urlButton.innerText = 'Go to Link';
                    urlButton.addEventListener('click', function () {
                        window.open(story.url, '_blank');
                    });

                    const commentsButton = document.createElement('button');
                    commentsButton.innerText = 'Comments';
                    commentsButton.addEventListener('click', function () {
                        loadAllComments(story.kids, storyBox);
                    });

                    const commentsCount = document.createElement('p');
                    commentsCount.innerText = `Comments: ${story.kids ? story.kids.length : 0}`;

                    storyBox.appendChild(title);
                    storyBox.appendChild(time);
                    storyBox.appendChild(link);
                    storyBox.appendChild(urlButton);
                    storyBox.appendChild(commentsButton);
                    storyBox.appendChild(commentsCount);

                    storiesContainer.appendChild(storyBox);
                });

                displayedStoryCount += storiesPerPage;

                if (displayedStoryCount >= topStoryIds.length) {
                    moreButton.style.display = 'none';
                } else {
                    moreButton.style.display = 'block';
                }
            })
            .catch(error => {
                console.error('Error during fetch operation:', error);
            });
    }

    function loadAllComments(commentIds, commentsContainer) {
        const allCommentPromises = [];

        function loadCommentsRecursively(ids) {
            ids.forEach(id => {
                allCommentPromises.push(
                    fetch(`https://hacker-news.firebaseio.com/v0/item/${id}.json`)
                        .then(response => response.json())
                        .then(comment => {
                            if (comment.kids) {
                                return loadCommentsRecursively(comment.kids);
                            }
                            return comment;
                        })
                );
            });
        }

        loadCommentsRecursively(commentIds);

        Promise.all(allCommentPromises)
            .then(allComments => {
                console.log('All Comments:', allComments);

                allComments.forEach(comment => {
                    if (comment && commentsContainer) { // Check if commentsContainer is defined
                        const commentDiv = document.createElement('div');
                        commentDiv.classList.add('comment-box');

                        const commentText = document.createElement('p');
                        commentText.classList.add('comment-text'); // Add a class for styling
                        commentText.innerText = comment.text;

                        commentDiv.appendChild(commentText);
                        commentsContainer.appendChild(commentDiv);
                    }
                });
            })
            .catch(error => {
                console.error('Error during fetch operation:', error);
            });
    }

    loadMoreStories();

    moreButton.addEventListener('click', loadMoreStories);
});
