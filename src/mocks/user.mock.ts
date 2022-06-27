import { IUserDocument } from '@user/interfaces/user.interface';

export const existingUser: IUserDocument = ({
  birthDay: {
    month: '',
    day: ''
  },
  notifications: {
    messages: false,
    reactions: true,
    comments: true,
    follows: false
  },
  passwordResetToken: '',
  passwordResetExpires: '',
  postCount: 7,
  gender: '',
  quotes: 'The earth is mine and the fullness thereof.',
  about: 'I am a cool guy',
  relationship: '',
  blocked: [],
  blockedBy: [],
  followersCount: 1,
  followingCount: 2,
  bgImageVersion: '',
  bgImageId: '',
  profilePicture: 'https://res.cloudinary.com/ratingapp/image/upload/60263f14648fed5246e322d9',
  _id: '60263f14648fed5246e322d9',
  uId: '1621613119252066',
  username: 'Manny',
  email: 'manny@me.com',
  avatarColor: '#9c27b0',
  password: '',
  work: [
    {
      company: 'Test Inc.',
      position: 'CEO',
      city: 'Dusseldorf',
      description: '',
      from: '2020',
      to: '',
      _id: '6031932745480c0e726d9b55'
    }
  ],
  school: [
    {
      name: 'University College Lodon',
      course: 'Mathematics',
      degree: 'M.Sc',
      from: '2014',
      to: '2016',
      _id: '60435862473835f7ccaee5cd'
    }
  ],
  placesLived: [
    {
      city: 'Lagos',
      country: 'Nigeria',
      year: '1989',
      month: 'March',
      _id: '604359b5473835f7ccaee5cf'
    }
  ],
  createdAt: new Date()
} as unknown) as IUserDocument;
