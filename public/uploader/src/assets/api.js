const BASE_PATH = 'http://localhost:39999';

const API = {
  base: BASE_PATH,
  /**
   * * token (music & upload need this query ?token=xxx)
   */
  token: BASE_PATH + '/token',
  /**
   * * music form 
   * GET     /music     get all songs
   * GET     /music/id  get one song by id
   * POST    /music     create a song
   * PUT     /music/id  update a song
   * DELETE  /music/id  delete a song
   */
  music: BASE_PATH + '/music',
  
  /**
   * * music file(such as mp3 file)
   * GET     /file/fileName  get the song by name
   * POST    /file           create the song
   * DELETE  /file/fileName  delete the song by name
   */
  upload: BASE_PATH + '/file',
}

export default API;