export const formatDate = (dateString: string): string => {
  const date = new Date(dateString);
  const now = new Date();
  const diffInSeconds = Math.floor((now.getTime() - date.getTime()) / 1000);

  const diffInDays = Math.floor(diffInSeconds / (24 * 3600)); 

  if (diffInDays <= 0) {
    // - 1 dia
    if (diffInSeconds < 60) {
      return `há ${diffInSeconds} seg`;
    } else if (diffInSeconds < 3600) {
      const minutes = Math.floor(diffInSeconds / 60);
      return `há ${minutes} min`;
    } else {
      const hours = Math.floor(diffInSeconds / 3600);
      return `há ${hours} h`;
    }
  } else if (diffInDays <= 30) {
    //  1 - 30 dias
    return `há ${diffInDays} dias`;
  } else {
    // +30 dias
    const day = date.getDate().toString().padStart(2, "0");
    const month = (date.getMonth() + 1).toString().padStart(2, "0");
    const year = date.getFullYear();
    const hours = date.getHours().toString().padStart(2, "0");
    const minutes = date.getMinutes().toString().padStart(2, "0");
    return `${day}/${month}/${year} - ${hours}:${minutes}`;
  }
};
