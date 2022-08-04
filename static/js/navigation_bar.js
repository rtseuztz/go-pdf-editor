$("#search").on("click", e => {
    searchUser();
})
$("#summoner_input").on('keypress', e => {
    if (e.which === 13) searchUser();
})

searchUser = () => {
        let summonerName = $("#summoner_input").val();
        if (summonerName.trim().length > 0) {
            window.location.href = "/summoner/" + summonerName;
        }
    
}