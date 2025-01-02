export const CommonConstants = {
    REGEX_PATTERN: {
        emailPattern: /^[_A-Za-z0-9-\+]+(\.[_A-Za-z0-9-]+)*@[A-Za-z0-9-]+(\.[A-Za-z0-9]+)*(\.[A-Za-z]{2,})$/,
    }
}

export interface wishList{
    id: number;
    im: string;
    n: string;
    fav: boolean;
    price: number;
    text: string;
}