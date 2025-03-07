import imghdr

def get_image_type(image_path):
    # ใช้ imghdr ตรวจสอบประเภทของไฟล์ภาพ
    image_type = imghdr.what(image_path)
    if image_type:
        return image_type  # หากตรวจพบประเภทของไฟล์ภาพ
    else:
        return "Unknown file type"  # หากไม่สามารถตรวจสอบได้
