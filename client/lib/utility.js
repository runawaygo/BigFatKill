function getRandom(max){
    var vNum;
    vNum = Math.random();
    vNum = Math.round(vNum * max);
    return vNum;
}

function wrapForBackgroundImage(imageUrl)
{
	return 'url('+imageUrl+')';
}