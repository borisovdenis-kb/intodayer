import urllib.request

SMSLOGIN = 'nostromo1010'
SMSPASSWORD = '8783212293'
SMSADDRESS =  'https://lcab.smsprofi.ru/API/XML/send.php'

def sendHelloSMS(PHONE):
    TEXT = ''
    SOURCE = 'ThreePachanZ'
    XML = '''<?xml version='1.0' encoding='UTF-8'?>
    <data>
        <login>%s</login>
        <password>%s</password>
        <action>send</action>
        <text>%s</text>
        <source>%s</source>
        <to number='%s'></to>
    </data>''' % (SMSLOGIN, SMSPASSWORD, TEXT, SOURCE, PHONE)

    XML = XML.encode('utf-8')

    response = urllib.request.urlopen(SMSADDRESS, XML)
    html = response.read().decode('utf-8')
    print(html)