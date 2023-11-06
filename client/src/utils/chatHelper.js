
export const getOtherUser = (arr, id) => {
  if(arr[0]._id===id) {
    return arr[1];
  }else {
    return arr[0];
  }
}