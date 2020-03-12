//标准组件环境
import React from 'react';
import PropTypes from 'prop-types'
import { bindActionCreators } from 'redux';
import { connect } from 'react-redux';
import { Route, Redirect } from 'react-router-dom';
import { message, Layout, Form, Row, Col, Input, Select, Button, Icon, Table, Pagination, Divider, Modal, Radio } from 'antd';
const FormItem = Form.Item;
const RadioGroup = Radio.Group;
const { TextArea } = Input;
//基本字典接口方法引入
import { loadDictionary } from '@/actions/dic';
//组件实例模板方法引入
import { searchFormItemLayout, searchFormItemLayout24, loadBizDictionary, onSearch, onPageIndexChange, onShowSizeChange, onToggleSearchOption, renderSearchTopButtons, renderSearchBottomButtons } from '@/utils/componentExt';
//数据转字典标题
import { getDictionaryTitle, timestampToTime, getViewEditModeTitle, dataBind } from '@/utils';
import { env } from '@/api/env';

//业务数据视图（增、删、改、查)
import ContentBox from '@/components/ContentBox';
import FileUploader from '@/components/FileUploader';
import EditableCourseName from '@/components/EditableCourseName';
import EditableTeacher from '@/components/EditableTeacher';
import SelectItem from '@/components/BizSelect/SelectItem';
import SelectItemCourseCategory from '@/components/BizSelect/SelectItemCourseCategory';

const btnformItemLayout = {
    wrapperCol: { span: 24 },
};
class MaterialsAreaView extends React.Component {


    constructor(props) {
        super(props)
        //扩展方法用于本组件实例
        this.loadBizDictionary = loadBizDictionary.bind(this);
        this.onToggleSearchOption = onToggleSearchOption.bind(this);
        this.renderSearchTopButtons = renderSearchTopButtons.bind(this);
        this.renderSearchBottomButtons = renderSearchBottomButtons.bind(this);
        this.onSearch = onSearch.bind(this);
        this.onPageIndexChange = onPageIndexChange.bind(this);
        this.onShowSizeChange = onShowSizeChange.bind(this);

        this.state = {
            dataModel: props.currentDataModel,//数据模型
            editMode: '',//Edit,Create,View,Delete
            data: [],
            totalRecord: 0,
            loading: false,

        };

    }

    onSubmit = () => {
        if (this.props.editMode == 'AddArea') {
            //表单验证后，合并数据提交
            this.props.form.validateFields((err, values) => {
                if (!err) {
                    if(values.teacher.length) values.teacher = values.teacher[0].id;
                    if(values.courseId.length) values.courseId = values.courseId[0].id;
                    this.setState({ loading: true });
                    setTimeout(() => {
                        this.setState({ loading: false });
                    }, 3000);//合并保存数据
                    this.props.viewCallback({ ...values });//合并保存数据
                }
            });
        } else {
            this.props.form.validateFields((err, values) => {
                if (!err) {
                    if(values.teacher.length) values.teacher = values.teacher[0].id;
                    if(values.courseId.length) values.courseId = values.courseId[0].id;
                    this.setState({ loading: true });
                    setTimeout(() => {
                        this.setState({ loading: false });
                    }, 3000);//合并保存数据
                    this.props.viewCallback({materialId:this.state.dataModel.materialId, ...values });//合并保存数据
                }
            });
        }

    }
    onCancel = () => {
        this.props.viewCallback();//合并保存数据
    }

    //多种模式视图处理
    renderEditModeOfView() {
        let block_content = <div></div>
        const { getFieldDecorator } = this.props.form;

        switch (this.props.editMode) {
            case "AddArea":
            case "EditArea":
                block_content = (
                    <Form >
                        <Row gutter={24}>
                        <Col span={12}>
                            <FormItem {...searchFormItemLayout} label={'资料名称'} >
                                {getFieldDecorator('materialName', { 
                                    initialValue: this.state.dataModel.materialName,
                                    rules: [{ required: true, message: '请输入资料名称!' }],
                                 })(
                                <Input placeholder="资料名称" />
                                )}
                            </FormItem>
                        </Col>
                        <Col span={12}>
                            <FormItem {...searchFormItemLayout} label="状态">
                            {getFieldDecorator('status', {
                                initialValue: dataBind(this.state.dataModel.statusFlag),
                                rules: [{
                                    required: true, message: '请选择状态!',
                                }]
                            })(
                                <RadioGroup value={dataBind(this.state.dataModel.materialStatus)} hasFeedback>
                                {this.props.dic_Status.map((item, index) => {
                                    return <Radio value={item.value} key={index}>{item.title}</Radio>
                                })}
                                </RadioGroup>
                                )}
                            </FormItem>
                        </Col>
                        <Col span={12}>
                            <FormItem {...searchFormItemLayout} label={'资料类型'} >
                                {getFieldDecorator('materialType', { 
                                    initialValue: dataBind(this.state.dataModel.typeFlag),
                                    rules: [{ required: true, message: '请选择资料类型!' }],
                                 })(
                                    <Select>
                                        <Option value="">--请选择--</Option>
                                        {this.props.material_type.map((item, index) => {
                                            return <Option value={item.value} key={index}>{item.title}</Option>
                                        })}
                                    </Select>
                                )}
                            </FormItem>
                        </Col>
                        <Col span={12} >
                            <FormItem {...searchFormItemLayout}
                                label="是否外购">
                                {getFieldDecorator('isOutside', { 
                                    initialValue: dataBind(this.state.dataModel.outsideFlag),
                                    rules: [{ required: true, message: '请选择是否外购!' }],
                                 })(
                                    <Select>
                                        <Option value="">--请选择--</Option>
                                        {this.props.dic_YesNo.map((item, index) => {
                                            return <Option value={item.value} key={index}>{item.title}</Option>
                                        })}
                                    </Select>
                                )}
                            </FormItem>
                        </Col>
                        <Col span={12} >
                            <FormItem {...searchFormItemLayout}
                                label="是否打包资料">
                                {getFieldDecorator('isPack', { 
                                    initialValue: dataBind(this.state.dataModel.packFlag),
                                    rules: [{ required: true, message: '请选择是否打包资料!' }],
                                 })(
                                    <Select>
                                        <Option value="">--请选择--</Option>
                                        {this.props.dic_YesNo.map((item, index) => {
                                            return <Option value={item.value} key={index}>{item.title}</Option>
                                        })}
                                    </Select>
                                )}
                            </FormItem>
                        </Col>
                        <Col span={12}>
                            <FormItem {...searchFormItemLayout} label={'教师'} >
                                {getFieldDecorator('teacher', { initialValue: (!this.state.dataModel.teacherId ? [] : [{
                                        id: this.state.dataModel.teacherId,
                                        name: this.state.dataModel.teacher
                                      }]) })(
                                    <EditableTeacher  maxTags={1} />
                                )}
                            </FormItem>
                        </Col>
                        <Col span={12}>
                            <FormItem {...searchFormItemLayout} label={'所属项目'}>
                                {getFieldDecorator('itemId', {
                                initialValue: dataBind(this.state.dataModel.itemId)
                                })(
                                <SelectItem
                                    scope={'my'}
                                    hideAll={true}
                                    hidePleaseSelect={false}
                                    onSelectChange={(value) => {
                                    this.state.dataModel.itemId = value;
                                    this.setState({ dataModel: this.state.dataModel });
                                    }}
                                />
                                )}
                            </FormItem>
                        </Col>
                        <Col span={12} >
                            <FormItem
                                {...searchFormItemLayout}
                                label="所属科目"
                            >
                                {getFieldDecorator('courseCategoryId', { initialValue: dataBind(this.state.dataModel.courseCategoryId) })(
                                <SelectItemCourseCategory isMain={true} itemId={this.state.dataModel.itemId} hideAll={false} />
                                )}
                            </FormItem>
                        </Col>
                        <Col span={12} >
                            <FormItem
                                {...searchFormItemLayout}
                                label="所属课程"
                            >
                                {getFieldDecorator('courseId', { initialValue: (!this.state.dataModel.teacherId ? [] : [{
                                        id: this.state.dataModel.courseId,
                                        name: this.state.dataModel.courseName
                                      }]) })(
                                    <EditableCourseName  maxTags={1} />
                                )}
                            </FormItem>
                        </Col>
                        <Col span={24}>
                            <FormItem 
                                {...searchFormItemLayout24} 
                                label='附件'
                                extra={this.state.dataModel.materialFile && <a href={env.serverURL + this.state.dataModel.materialFile} target='_Blank'>下载已上传的附件</a>}
                            >
                                {getFieldDecorator('materialFile', {
                                    initialValue: dataBind(this.state.dataModel.materialFile),
                                })(
                                    <FileUploader />
                                )}
                            </FormItem>
                        </Col>
                           
                        
                        <Col span={24}>
                            <FormItem {...searchFormItemLayout24} label="说明">
                            {getFieldDecorator('remark', {
                                initialValue: dataBind(this.state.dataModel.remark),
                            })(
                                <TextArea rows={4} />
                                )}
                            </FormItem>
                        </Col>

                        </Row>
                    </Form>
                );
                break;

        }
        return block_content;
    }
    //表单按钮处理
    renderBtnControl() {
        return <FormItem
            className='btnControl'
            {...btnformItemLayout}
        >
            <Button type="primary" loading={this.state.loading} icon="save" onClick={this.onSubmit}>{getViewEditModeTitle(this.props.editMode == 'EditArea' ? 'Edit' : 'Create')}</Button><span className="split_button"></span><Button icon="rollback" onClick={this.onCancel} >取消</Button>
        </FormItem>
    }
    //标题
    getTitle() {
        let op = getViewEditModeTitle(this.props.editMode == 'EditArea' ? 'Edit' : 'Create');
        return `${op}资料`;
    }
    //渲染，根据模式不同控制不同输出
    render() {
        let title = this.getTitle();
        let block_editModeView = this.renderEditModeOfView();
        return (
            <ContentBox titleName={title} bottomButton={this.renderBtnControl()}>
                <div className="dv_split"></div>
                {block_editModeView}
                <div className="dv_split"></div>
            </ContentBox>
        );

    }

}





//表单组件 封装
const WrappedMaterialsAreaView = Form.create()(MaterialsAreaView);

const mapStateToProps = (state) => {
    //基本字典数据
    let { Dictionarys } = state.dic;
    return { Dictionarys };
};

function mapDispatchToProps(dispatch) {
    return {
        //基本字典接口
        loadDictionary: bindActionCreators(loadDictionary, dispatch),
    };
}
//redux 组件 封装
export default connect(mapStateToProps, mapDispatchToProps)(WrappedMaterialsAreaView);
