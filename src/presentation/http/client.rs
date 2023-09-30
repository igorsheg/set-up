use axum::http::StatusCode;
use axum_extra::extract::{cookie::Cookie, CookieJar};

pub async fn auth(jar: CookieJar) -> Result<CookieJar, StatusCode> {
    let mut new_jar = jar.clone();
    if new_jar.get("client_id").is_none() {
        let new_id: u16 = rand::random();
        let new_id_str = new_id.to_string();
        let mut cookie = Cookie::new("client_id", new_id_str);
        cookie.set_path("/");
        new_jar = new_jar.add(cookie);
    }

    Ok(new_jar)
}
