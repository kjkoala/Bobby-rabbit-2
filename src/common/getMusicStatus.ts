export const getMusicStatus = () =>  {
    const musicStatus = localStorage.getItem('enableMusicBobbyCarrot2')
    return musicStatus === '1' || musicStatus === null ? true : false
} 