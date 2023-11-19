const APIController = (function () {
    const clientId = 'af911c09970443788f961ee3fccef436';                     /* YOUR CLIENT ID needs to put here to make it work */
    const clientSecret = '11f54c75ab0943ac817bd7a95dfbd8c3';

    // private methods
    const _getToken = async () => {
        const result = await fetch('https://accounts.spotify.com/api/token', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/x-www-form-urlencoded',
                'Authorization': 'Basic ' + btoa(clientId + ':' + clientSecret)
            },
            body: 'grant_type=client_credentials'
        });

        const data = await result.json();
        return data.access_token;
    };

    const _getGenres = async (token) => {
        
        const result = await fetch('https://api.spotify.com/v1/browse/categories?locale=sv_US', {
            method: 'GET',
            headers: {
                'Authorization': 'Bearer ' + token
            }
        });

        const data = await result.json();
        return data.categories.items;
    };

    const _getPlaylists = async (token, genreId) => {

        const result = await fetch(`https://api.spotify.com/v1/browse/categories/${genreId}/playlists?locale=sv_US`, {
            method: 'GET',
            headers: {
                'Authorization': 'Bearer ' + token
            }
        });

        const data = await result.json();
        return data.playlists.items;
    };

    const _getPlaylistTracks = async (token, playlistId) => {

        const result = await fetch(`https://api.spotify.com/v1/playlists/${playlistId}/tracks`, {
            method: 'GET',
            headers: {
                'Authorization': 'Bearer ' + token
            }
        });

        const data = await result.json();
        return data.items.map(item => item.track);
    };

    return {
        getToken: async function () {
            return await _getToken();
        },

        getGenres: async function (token) {
            return await _getGenres(token);
        },

        getPlaylists: async function (token, genreId) {
            return await _getPlaylists(token, genreId);
        },

        getPlaylistTracks: async function (token, playlistId) {
            return await _getPlaylistTracks(token, playlistId);
        }
    };
})();

document.addEventListener('DOMContentLoaded', async function () {
    const token = await APIController.getToken();
    const genres = await APIController.getGenres(token);

    const selectGenre = document.getElementById('select_genre');
    const selectPlaylist = document.getElementById('select_playlist');
    const playerContainer = document.getElementById('PlayerContainer');

    // Create the selectSong dropdown outside of event listeners
    const selectSong = document.createElement('select');
    selectSong.classList.add('form-control', 'form-control-sm');
    selectSong.innerHTML = '<option>Select...</option>';
    playerContainer.appendChild(selectSong);

    genres.forEach(genre => {
        const option = document.createElement('option');
        option.value = genre.id;
        option.text = genre.name;
        selectGenre.appendChild(option);
    });

    selectGenre.addEventListener('change', async function () {
        const selectedGenreId = selectGenre.value;
        const playlists = await APIController.getPlaylists(token, selectedGenreId);

        // Clear existing options and reset the selected index to 0
        selectPlaylist.innerHTML = '<option>Select...</option>';
        selectPlaylist.selectedIndex = 0;

        
        playlists.forEach(playlist => {
            const option = document.createElement('option');
            option.value = playlist.id;
            option.text = playlist.name;
            selectPlaylist.appendChild(option);
        });
    });

    selectPlaylist.addEventListener('change', async function () {
        const selectedPlaylistId = selectPlaylist.value;
        const tracks = await APIController.getPlaylistTracks(token, selectedPlaylistId);

        // Update the options in the selectSong dropdown without clearing existing options
        // Clear existing options and reset the selected index to 0
        selectSong.innerHTML = '<option>Select...</option>';
        selectSong.selectedIndex = 0;

        tracks.forEach(track => {
            const option = document.createElement('option');
            option.value = track.id;
            option.text = track.name;
            selectSong.appendChild(option);
        });
    });

    selectSong.addEventListener('change', function () {
        const selectedTrackId = selectSong.value;
        const playerFrame = document.createElement('iframe');
        playerFrame.setAttribute('src', `https://open.spotify.com/embed/track/${selectedTrackId}`);
        playerFrame.setAttribute('width', '300');
        playerFrame.setAttribute('height', '80');
        playerFrame.setAttribute('frameborder', '0');
        playerFrame.setAttribute('allowtransparency', 'true');
        playerFrame.setAttribute('allow', 'encrypted-media');

        playerContainer.innerHTML = '';
        playerContainer.appendChild(playerFrame);
    });
});
