export type Apartment = {
  id: string,
  complex_id: string,
  apartment_code: string,
  apartment_number: string,
  user?: string
}

export type ResComplex = {
  id: string,
  name: string
}

export type VoipToken = {
  id: string,
  type: string | 'ios' | 'android',
  token: string,
  user_id: string
}

export type OfferCandidate = {
  id: string,
  call_id: string,
  data: {
    candidate: string,
    sdpMLineIndex: number,
    sdpMid: string,
    usernameFragment: string
  }
}
export type AnswerCandidate = {
  id: string,
  call_id: string,
  data: {
    candidate: string,
    sdpMLineIndex: number,
    sdpMid: string,
  }
}

export type Call = {
  id: string,
  offer?: {
    sdp: string,
    type: string
  },
  answer?: {
    sdp: string,
    type: string
  },
  status: string | 'CONNECTED' | 'ENDED' | 'START' | 'ERROR',
  apartment_number: string,
  complex_id: string,
  call_uuid: string
}