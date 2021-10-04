#!/usr/bin/env python3

import re
import time
# import pytz
import requests
import concurrent.futures
from hashlib import sha1
from lxml import etree, html
from sqlite3worker import Sqlite3Worker
from datetime import datetime, timedelta

# tz = pytz.timezone('Asia/Jakarta')
sqlite = Sqlite3Worker('database.sqlite')


def get_article_metadatas_from_loadmore(page: int = 1, limit: int = 8) -> list:
    url = f"https://greatmind.id/article/loadmore?page={page}&limit={limit}"
    content = requests.get(url).json().get('view')
    doc = html.fromstring(content)
    covers = doc.xpath("//div[contains(@class, 'post-item__image')]/a/img/@src")
    categories = doc.xpath("//div[contains(@class, 'post-item__body')]/a/text()")
    categories = list(map(lambda x: x.strip(), categories))
    titles = doc.xpath("//*[contains(@class, 'post-item__title')]/a/text()")
    titles = list(map(lambda x: x.strip(), titles))
    author_avatars = doc.xpath("//img[contains(@class, 'post-item__author-img')]/@src")
    author_names = doc.xpath("//strong[contains(@class, 'post-item__author')]/text()")
    author_names = list(map(lambda x: x.strip().replace('By ', ''), author_names))
    urls = doc.xpath("//*[contains(@class, 'post-item__title')]/a/@href")
    excerpts = doc.xpath("//p[contains(@class, 'post-item__excerpt')]/text()")
    excerpts = list(map(lambda x: ' '.join(x.strip().split()), excerpts))
    dates = doc.xpath("//div[contains(@class, 'post-item__footer')]/div/text()")
    dates = list(map(lambda x: x.strip(), dates))
    dates = list(filter(lambda x: x != '', dates))
    topics = doc.xpath("//div[contains(@class, 'post-item__footer')]/div[2]/a/text()")

    return list(map(lambda i: {
        'cover': covers[i],
        'category': categories[i],
        'title': titles[i],
        'url': urls[i],
        'excerpt': excerpts[i],
        'author_avatar': author_avatars[i],
        'author_name': author_names[i],
        'date': dates[i],
        'topic': topics[i],
    }, range(0, limit)))


def get_article_metadata_from_detail(url: str) -> dict:
    content = requests.get(url).content
    doc = html.fromstring(content)
    # category = doc.xpath("//header/div/a[1]/text()")[0].strip()
    # topic = doc.xpath("//header/div/a[last()]/text()")[0].strip()
    # title = doc.xpath("//header//h1/text()")[0].strip()
    # cover = doc.xpath("//section[contains(@class, 'header--fullscreen')]/img/@src")[0].strip()
    # author_url = doc.xpath("//div[contains(@class, 'author-section')]/div/a[1]/@href")[0].strip()
    # author_avatar = doc.xpath("//div[contains(@class, 'author-section')]/div/a[1]/img/@src")[0].strip()
    # author_name = doc.xpath("//h3[contains(@class, 'author__name')]/text()")[0].strip()
    author_desc = doc.xpath("//p[contains(@class, 'author__description')]/text()")[0].strip()
    content_element = doc.xpath("//article[contains(@class, 'content')]")[0]
    content_string = etree.tostring(content_element).decode('utf-8').strip()
    content_matches = re.findall(r'<article class="content">(.*)<\/article>', content_string, re.DOTALL)

    return {
        'author_desc': author_desc,
        'content': content_matches[0].strip(),
    }


# sequence used to keep article in order
def process_get_articles_from_loadmore(page: int) -> None:
    articles = get_article_metadatas_from_loadmore(page)
    for index, article in enumerate(articles):
        print(f">> saving {article['url']}")
        sequence = 999-page-index;
        date = datetime.strptime(article['date'], '%d %B %Y')
        date = date + timedelta(seconds=sequence)
        articleId = sha1(article['url'].encode()).hexdigest()
        sqlite.execute(
            "INSERT OR IGNORE INTO articles VALUES(?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)",
            (
                articleId,
                article['cover'], article['category'], article['title'],
                article['url'], article['excerpt'], article['author_avatar'],
                article['author_name'], date, article['topic'], '', ''
            )
        )


def process_completing_article_metadata(id: int, url: str) -> None:
    data = get_article_metadata_from_detail(url)
    print(f">> saving {url}")
    sqlite.execute(
        "UPDATE articles SET author_desc=?, content=? WHERE id=?",
        (data['author_desc'], data['content'], id)
    )



def main() -> None:
    start = time.time()

    sqlite.execute('''CREATE TABLE IF NOT EXISTS articles (
        id TEXT PRIMARY KEY,
        cover TEXT, category TEXT, title TEXT,
        url TEXT, excerpt TEXT, author_avatar TEXT,
        author_name TEXT, date timestamp, topic TEXT,
        author_desc TEXT, content TEXT
    )''')

    # step 1: crawl the articles
    # with concurrent.futures.ThreadPoolExecutor(max_workers=10) as executor:
    #     futures = []
    #     last_page = 5 # manually query
    #     # last_page = 134 # manually query
    #     for i in range(1, last_page+1):
    #         print(f"> crawling page {i}")
    #         futures.append(executor.submit(process_get_articles_from_loadmore, page=i))
    #     for future in concurrent.futures.as_completed(futures):
    #         print(f"> crawling pages complete")

    # step 2: complete metadata of each article
    # this will query data from sqlite database
    # results = sqlite.execute("SELECT id, url from articles WHERE content='' limit 50")
    # with concurrent.futures.ThreadPoolExecutor(max_workers=10) as executor:
    #     futures = []
    #     for id, url in results:
    #         print(f"> completing metadata of {url}")
    #         futures.append(executor.submit(process_completing_article_metadata, id=id, url=url))
    #     for future in concurrent.futures.as_completed(futures):
    #         print(f"> completing metadata complete")

    print('\n It took', time.time()-start, 'seconds.')


if __name__ == "__main__":
    main()
    sqlite.close()
