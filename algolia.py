import os
from sqlite3worker import Sqlite3Worker
from algoliasearch.search_client import SearchClient

sqlite = Sqlite3Worker('database.sqlite')

client = SearchClient.create(
  os.environ['ALGOLIA_APP_ID'],
  os.environ['ALGOLIA_API_KEY'],
)

index = client.init_index('articles')

articles = sqlite.execute("SELECT * FROM articles ORDER BY `date` DESC LIMIT 100")

final_articles = []
for article in articles:
  final_articles.append({
    'objectID': article[0],
    'id': article[0],
    'cover': article[1],
    'category': article[2],
    'title': article[3],
    'url': article[4],
    'excerpt': article[5],
    'author_avatar': article[6],
    'author_name': article[7],
    'date': article[8].strftime('%Y-%m-%d %H:%M:%S'),
    'topic': article[9],
    'author_desc': article[10],
    'content': article[11],
  })

try:
  index.save_objects(final_articles, {'autoGenerateObjectIDIfNotExist': True})
  print('success')
except:
  print('failed')
