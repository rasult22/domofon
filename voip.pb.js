/// <reference path="./pb_data/types.d.ts" />
// fires only for "users" and "articles" collections

onRecordAfterCreateRequest((e) => {
  const call = e.record;

  const apartment = $app.dao().findFirstRecordByFilter('apartments', `apartment_number="${call.apartment_number}" && complex_id="${call.complex_id}"`)

  
  if (apartment.user) {
    console.log('send voip push')
    const voipTokens = $app.dao().findRecordsByFilter('voip_tokens', `user_id="${apartment.user}"`)

    if (voipTokens.length) {
      console.log(voipTokens, "voipTokens");
      voipTokens.forEach((tokenRecord) => {
        if (tokenRecord.type === 'ios') {
          $http.send({
            url: `https://api.sandbox.push.apple.com/3/device/${tokenRecord.token}`,

            method: 'POST',
            headers: {
              'apns-topic': 'com.rasult22.domofon.voip',
              'apns-push-type': 'voip',
              'Content-Type': 'application/json',
              'authorization': `Bearer`
            },
            body: JSON.stringify({
              "aps": {
                uuid: call.call_uuid,
                call_id: call.id,
              }
            })

          })
        }
      })
    }
  }
}, 'calls')