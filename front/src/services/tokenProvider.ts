const tokenMap = new Map<string,string>();

//get 
export const getAccessToken = () => {
    return tokenMap.get('accessToken');
}
//set
export const setAccessToken = (accessToken: string) => {
    tokenMap.set('accessToken', accessToken);
}

//clear
export const cleartoken = () => {
    tokenMap.clear();
}