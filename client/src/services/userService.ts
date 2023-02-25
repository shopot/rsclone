import { simpleApiClient, HTTPRequestMethod, ApiEndpoint } from '../shared/api';
import { validateAPIError } from '../shared/validators';
import { TypeAPIError } from '../shared/types';

function DataURIToBlob(dataURI: string) {
  const splitDataURI = dataURI.split(',');
  const byteString =
    splitDataURI[0].indexOf('base64') >= 0 ? atob(splitDataURI[1]) : decodeURI(splitDataURI[1]);
  const mimeString = splitDataURI[0].split(':')[1].split(';')[0];

  const ia = new Uint8Array(byteString.length);
  for (let i = 0; i < byteString.length; i++) ia[i] = byteString.charCodeAt(i);

  return new Blob([ia], { type: mimeString });
}

export const userService = {
  async uploadAvatar(base64Img: string) {
    const formData = new FormData();
    const fileBlob = DataURIToBlob(base64Img);
    formData.append('image', fileBlob, `avatar-${Date.now()}.jpg`);

    const response = await simpleApiClient.fetch(
      HTTPRequestMethod.POST,
      ApiEndpoint.UploadAvatar,
      {},
      formData,
    );

    if (response.status === 201) {
      return { data: response.data };
    } else if (validateAPIError(response)) {
      const error: TypeAPIError = response.data;
      return { error };
    } else {
      return { error: { statusCode: response.status, message: response.statusText } };
    }
  },
};
