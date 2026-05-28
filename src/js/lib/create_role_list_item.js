export function createRoleListItem(document, item, url, region, { hidesAccountId }, selectHandler) {
  const li = document.createElement('li');
  const headSquare = document.createElement('span');
  headSquare.textContent = ' ';
  headSquare.className = 'headSquare';
  if (item.color) {
    headSquare.style.backgroundColor = `#${item.color}`;
  } else if (!item.image) {
    // set gray if both color and image are undefined
    headSquare.style.backgroundColor = '#aaaaaa';
  }
  if (item.image) {
    // Validate as an http(s) URL before using it in a CSS url(). The image
    // value can originate from an externally pushed config, so reject anything
    // that is not a parseable web URL to prevent CSS injection / breakout.
    const rawImage = item.image.replace(/"/g, '');
    let safeImageUrl = null;
    try {
      const parsed = new URL(rawImage);
      if (parsed.protocol === 'https:' || parsed.protocol === 'http:') {
        safeImageUrl = parsed.href;
      }
    } catch {}
    if (safeImageUrl) {
      headSquare.style.backgroundImage = `url("${encodeURI(safeImageUrl)}")`;
    }
  }

  const anchor = document.createElement('a');
  anchor.href = "#";
  anchor.title = item.role_name + '@' + item.aws_account_id;
  anchor.dataset.profile = item.name;
  anchor.dataset.rolename = item.role_name;
  anchor.dataset.account = item.aws_account_id;
  anchor.dataset.color = item.color || 'aaaaaa';
  anchor.dataset.redirecturi = createRedirectUri(url, region, item.region);
  anchor.dataset.search = item.name.toLowerCase() + ' ' + item.aws_account_id;

  anchor.appendChild(headSquare);

  const textDiv = document.createElement('div');
  textDiv.className = 'aesr-role-item-text';

  const nameSpan = document.createElement('span');
  nameSpan.className = 'aesr-role-item__name';
  nameSpan.textContent = item.name;
  textDiv.appendChild(nameSpan);

  if (hidesAccountId) {
    anchor.dataset.displayname = createDisplayName(item.name);
  } else {
    anchor.dataset.displayname = createDisplayName(item.name, item.aws_account_id);

    const accountIdSpan = document.createElement('span');
    accountIdSpan.className = 'aesr-role-item__account';
    accountIdSpan.textContent = item.aws_account_id;
    textDiv.appendChild(accountIdSpan);
  }

  anchor.appendChild(textDiv);

  anchor.onclick = function() {
    const data = { ...this.dataset }; // do not directly refer DOM data in Firefox
    selectHandler(this, data)
    return false;
  }

  li.appendChild(anchor);

  return li
}

function createRedirectUri(currentUrl, curRegion, destRegion) {
  let redirectUri = currentUrl;
  if (curRegion && destRegion && curRegion !== destRegion) {
    redirectUri = redirectUri.replace('region=' + curRegion, 'region=' + destRegion);
  }
  return encodeURIComponent(redirectUri);
}

function createDisplayName(profile, awsAccountId) {
  const maxLength = 64;
  const separator = '  |  ';
  const overflow = '…';

  let displayName = profile;
  let totalLength = displayName.length;

  if (awsAccountId !== undefined) {
    totalLength += separator.length + awsAccountId.length;
  }

  if (totalLength > maxLength) {
    displayName = displayName.substring(0, displayName.length - (totalLength - maxLength) - overflow.length)
                  + overflow;
  }

  if (awsAccountId !== undefined) {
    displayName += separator + awsAccountId;
  }
  
  return displayName;
}
